import { Component, OnInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { Papa, ParseResult } from 'ngx-papaparse';
import * as dot from 'dot-object';
import { Settings, Profile } from '../models/settings';
import { CloudAppRestService, CloudAppSettingsService, Request, HttpMethod, RestErrorResponse } from '@exlibris/exl-cloudapp-angular-lib';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';

const MAX_PARALLEL_CALLS = 5;

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
  running: boolean;
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
      complete: this.parsed,
      skipEmptyLines: 'greedy'
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

    let users: any[] = result.data.map(row => this.mapUser(row)), results = [];
    /* Generation of primary ID is not thread safe; only parallelize if primary ID is supplied */
    const parallel = users.every(user=>user.primary_id) ? MAX_PARALLEL_CALLS : 1;
    if(confirm(this.translate.instant("Main.ConfirmCreateUsers", {count: users.length}))) {
      this.running = true;
      from(users.map(user => this.createUser(user)))
      .pipe(mergeMap(obs=>obs, parallel))
      .subscribe({
        next: result => results.push(result),
        complete: () => {
          results.forEach(res=>this.log( isRestErrorResponse(res) ?
            `${this.translate.instant("Main.Failed")}: ${res.message}` : 
            `${this.translate.instant("Main.Created")}: ${res.primary_id}` )
          );
          this.log(this.translate.instant('Main.Finished'));
          this.running = false;
        }
      });
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
    return this.restService.call(request).pipe(catchError(e=>of(e)));
  }

  private mapUser = (user) => {
    const arrayIndicator = new RegExp(/\[\d*\]/);
    /* Map CSV to user fields */
    let obj = Object.entries(user).reduce((a, [k,v]) => {
      let f = this.selectedProfile.fields.find(f=>f.header===k)
      if ( f && f.fieldName && v ) {
        let fieldName = f.fieldName;
        if (arrayIndicator.test(fieldName)) { // array field
          fieldName = fieldName.replace(arrayIndicator, `[${Object.keys(a).filter(k=>k.replace(arrayIndicator,'[]')===fieldName).length}]`)
        }
        a[fieldName] = v;
      }
      return a;
    }, {});  
    /* Default values */
    let occurances = {};
    this.selectedProfile.fields.filter(f=>f.default).forEach(f=>{
      occurances[f.fieldName] = (occurances[f.fieldName] == undefined ? -1 : occurances[f.fieldName]) + 1;
      let name = f.fieldName.replace(/\[\]/g,`[${occurances[f.fieldName]}]`);
      if (!obj[name]) obj[name] = f.default;
    })
    obj = dot.object(obj);
    /* Preferred address, email, phone */
    if (obj['contact_info']) {
      if (Array.isArray(obj['contact_info']['address']) && obj['contact_info']['address'].length > 0)
        obj['contact_info']['address'][0]['preferred'] = true;
      if (Array.isArray(obj['contact_info']['email']) && obj['contact_info']['email'].length > 0)
        obj['contact_info']['email'][0]['preferred'] = true;
      if (Array.isArray(obj['contact_info']['phone']) && obj['contact_info']['phone'].length > 0)
        obj['contact_info']['phone'][0]['preferred'] = true;
    }
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

const isRestErrorResponse = (object: any): object is RestErrorResponse => 'error' in object;
