import { Component, OnInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { Papa, ParseResult } from 'ngx-papaparse';
import * as dot from 'dot-object';
import { Utils } from '../utilities';
import { Settings, Profile } from '../models/settings';
import {
  CloudAppRestService, CloudAppSettingsService, 
  Request, HttpMethod
} from '@exlibris/exl-cloudapp-angular-lib';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  files: File[] = [];
  settings: Settings;
  selectedProfile: Profile;
  results: String = '';
  @ViewChild('resultsPanel', {static: false}) private resultsPanel: ElementRef;

  constructor ( 
    private settingsService: CloudAppSettingsService, 
    private restService: CloudAppRestService, 
    private papa: Papa,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.settingsService.get().subscribe(settings => {
      this.settings = settings as Settings;
      this.selectedProfile = this.settings.profiles[0];
    });
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
  }
   
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }  

  reset() {
    this.files = [];
    this.results = '';
  }

  compareProfiles(o1: Profile, o2: Profile): boolean {
    return o1 && o2 ? o1.name === o2.name : o1 === o2;
  }  

  load() {
    this.log(this.translate.instant('Main.Parsing'));
    this.papa.parse(this.files[0], {
      header: true,
      complete: this.parsed
    });
  }

  ngAfterViewChecked() {        
    this.scrollToBottom();        
  } 

  scrollToBottom(): void {
    try {
      this.resultsPanel.nativeElement.scrollTop = this.resultsPanel.nativeElement.scrollHeight;
    } catch(err) { }                 
  }  

  private log = (str: string) => this.results += `${str}\n`;  

  private parsed = async (result: ParseResult) => {
    if (result.errors.length>0) 
      console.warn('Errors:', result.errors);

    let users = result.data.map(row => dot.object(this.mapUser(row)));
    console.log('users', users);
    if(confirm(this.translate.instant("Main.ConfirmCreateUsers", {count: users.length}))) {
      /* Chunk into 10 updates at at time */
      await Utils.asyncForEach(Utils.chunk(users, 10), async (batch) => {
        await Promise.all(batch.map(user => this.createUser(user))
        .map(Utils.reflect)) /* Handle resolution or rejection */
        .then(results => { 
          results.forEach(res=>this.log(res.status=='fulfilled' ? 
            'Created: ' + res.v.primary_id :
            'Failed: ' + res.e.message)
          );         
        })
      });
      this.log(`---- ${this.translate.instant('Main.Finished')} ----`);
    } else {
      this.results = '';
    }
  }

  private createUser(user) {
    let request: Request = {
      url: '/users',
      method: HttpMethod.POST,
      requestBody: user
    };
    return this.restService.call(request).toPromise();
  }

  private mapUser = (user) => {
    /* Map CSV to user fields */
    let obj = Object.entries(user).reduce((a, [k,v]) => {
      let f = this.selectedProfile.fields.find(f=>f.header===k.replace(/\[\d\]/,''))
      if ( f && f.fieldName && v ) {
        let fieldName = f.fieldName;
        if (fieldName.indexOf('[]')>0) { // array field
          let i=-1, matches = k.match(/(\[\d\])/); // array position included in file, i.e. Address[0]
          fieldName = matches ? 
            fieldName.replace(/\[\]/g, () => { i++; return matches[i] || '[0]'; }) : fieldName.replace(/\[\]/g, '[0]');
        }
        a[fieldName] = v;
      }
      return a;
    }, {});  
    /* Default values */
    this.selectedProfile.fields.filter(f=>f.default).forEach(f=>{
      if (!obj[f.fieldName])
        obj[f.fieldName.replace(/\[\]/g,'[0]')] = f.default;
    })
    /* Account Type */
    obj['account_type'] = { value: this.selectedProfile.accountType };

    return obj;
  }
}

@Injectable({
  providedIn: 'root',
})
export class MainGuard implements CanActivate {
  constructor(
    private settingsService: CloudAppSettingsService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      return this.settingsService.get().pipe( map( settings => {
        if (!settings.profiles) {
          this.router.navigate(['settings']);
          return false;
        }
        return true;
      }))
  }
}
