import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { Papa, ParseResult } from 'ngx-papaparse';
import * as dot from 'dot-object';
import { Utils } from 'src/utilities';
import { UsersService } from '../services/users.service';
import { Settings } from '../models/settings';

@Component({
  selector: 'app-csv-user-load',
  templateUrl: './csv-user-load.component.html',
  styleUrls: ['./csv-user-load.component.css']
})
export class CsvUserLoadComponent implements OnInit {
  files: File[] = [];
  settings: Settings;
  results: String = '';
  @ViewChild('resultsPanel', {static: false}) private resultsPanel: ElementRef;

  constructor ( 
    private settingsService: SettingsService, 
    private usersService: UsersService, 
    private papa: Papa 
  ) { }

  ngOnInit() {
    this.settingsService.settings.subscribe(settings=>this.settings=settings as Settings);
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

  load() {
    this.log('Parsing CSV file');
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

    let users = result.data.map(row => this.mapUser(row));
    users = users.map(r=>dot.object(r));
    console.log('users', users);
    if(confirm(`Are you sure you want to create ${users.length} users in Alma?`)) {
      /* Chunk into 10 updates at at time */
      await Utils.asyncForEach(Utils.chunk(users, 10), async (batch) => {
        await Promise.all(batch.map(user => this.usersService.createUser(user).toPromise()).map(Utils.reflect))
          .then(results => { 
            results.forEach(res=>this.log(res.status=='fulfilled' ?
              'Created: ' + res.v.primary_id :
              'Failed: ' + res.e.error.errorList.error[0].errorMessage)
              );
          });        
      });
      this.log('Finished');
    } else {
      this.results = '';
    }
  }


  private mapUser = (user) => {
    /* Map CSV to user fields */
    let obj = Object.entries(user).reduce((a, [k,v]) => {
      let f = this.settings.fields.find(f=>f.header===k.replace(/\[\d\]/,''))
      if ( f && f.fieldName ) {
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
    this.settings.fields.filter(f=>f.default).forEach(f=>{
      if (!obj[f.fieldName])
        obj[f.fieldName.replace(/\[\]/g,'[0]')] = f.default;
    })
    return obj;
  }

}
