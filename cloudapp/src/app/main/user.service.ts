import { Injectable } from '@angular/core';
import { CloudAppRestService, HttpMethod, RestErrorResponse } from '@exlibris/exl-cloudapp-angular-lib';
import { of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { Profile } from '../models/settings';
import * as dot from 'dot-object';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private restService: CloudAppRestService
  ) { }

  processUser(user: any, profileType: string) {
    switch (profileType) {
      case 'ADD':
        return this.restService.call({
          url: '/users',
          method: HttpMethod.POST,
          requestBody: user
        }).pipe(catchError(e=>of(this.handleError(e, user))));
      case 'UPDATE':
        return this.restService.call(`/users/${user.primary_id}`).pipe(
          catchError(e=>{
            if (e.error && e.error.errorList && e.error.errorList.error[0].errorCode == '401861') {
              return of(null)
            } else {
              throw(e);
            }
          }),
          switchMap(original=>{
            if (original==null) {
              return this.restService.call({
                url: '/users',
                method: HttpMethod.POST,
                requestBody: user
              });
            } else {
              delete original['user_role']; // Don't update roles
              return this.restService.call({
                url: `/users/${user.primary_id}`,
                method: HttpMethod.PUT,
                requestBody: Object.assign(original, user)
              })
            }
          }),
          catchError(e=>of(this.handleError(e, user)))
        )
      case 'DELETE': 
        return this.restService.call({
          url: `/users/${user.primary_id}`,
          method: HttpMethod.DELETE
        }).pipe(
          map(()=>({primary_id: user.primary_id})),
          catchError(e=>of(e))
        );
    }

  }

  private handleError(e: RestErrorResponse, user: any) {
    const props = ['primary_id', 'last_name', 'first_name'].map(p=>user[p]);
    if (user) {
      e.message = e.message + ` (${props.join(', ')})`
    }
    return e;
  }

  mapUser = (user: any, selectedProfile: Profile) => {
    const arrayIndicator = new RegExp(/\[\d*\]/);
    /* Map CSV to user fields */
    let obj = Object.entries<string>(user).reduce((a, [k,v]) => {
      let f = selectedProfile.fields.find(f=>f.header===k)
      if ( f && f.fieldName && v ) {
        let fieldName = f.fieldName;
        if (arrayIndicator.test(fieldName)) { // array field
          fieldName = fieldName.replace(arrayIndicator, `[${Object.keys(a).filter(k=>k.replace(arrayIndicator,'[]')===fieldName).length}]`)
        }
        a[fieldName] = ['true', 'false'].includes(v) ? (v==='true') : v;
      }
      return a;
    }, {});  
    /* Default values */
    let occurances = {};
    selectedProfile.fields.filter(f=>f.default).forEach(f=>{
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
    obj['account_type'] = { value: selectedProfile.accountType };

    return obj;
  }
}