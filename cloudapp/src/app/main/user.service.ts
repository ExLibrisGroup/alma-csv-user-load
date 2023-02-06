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
      case 'ENRICH':
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
              if (profileType == 'ENRICH') {
                this.enrichRepeatableElement (original.user_identifier, user.user_identifier);
                this.enrichRepeatableElement (original.user_note, user.user_note);
                this.enrichRepeatableElement (original.proxy_for_user, user.proxy_for_user);
                this.enrichRepeatableElement (original.user_statistic, user.user_statistic);
                if (user.contact_info) {
                  this.enrichRepeatableElement (original.contact_info.address, user.contact_info.address);
                  this.enrichRepeatableElement (original.contact_info.phone, user.contact_info.phone);
                  this.enrichRepeatableElement (original.contact_info.email, user.contact_info.email);
                }
                if (!user.contact_info && (original.contact_info.address || original.contact_info.phone || original.contact_info.email)) {
                  //No user.contact_info supplied; create empty to load with existing entries
                  user.contact_info = {};
                }
                if (!user.contact_info.address && original.contact_info.address) {
                  user.contact_info.address = [];
                  for (let i = 0; i < original.contact_info.address.length; i++) {
                    user.contact_info.address.push (original.contact_info.address[i]);        
                  }
                }
                if (!user.contact_info.phone && original.contact_info.phone) {
                  user.contact_info.phone = [];
                  for (let i = 0; i < original.contact_info.phone.length; i++) {
                    user.contact_info.phone.push (original.contact_info.phone[i]);
                  }
                }
                if (!user.contact_info.email && original.contact_info.email) {
                  user.contact_info.email = [];
                  for (let i = 0; i < original.contact_info.email.length; i++) {
                    user.contact_info.email.push (original.contact_info.email[i]);
                  }
                }
              }
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
          catchError(e=>of(this.handleError(e, user)))
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

  private enrichRepeatableElement (originalElements, newElements) {
    // This function will copy any of the originalElements into the newElements, thereby
    // adding repeatable elements. Thus, when the PUT happens, the "swap all" will include both 
    // old and new repeatables.
    if (originalElements && newElements) {
      for (let i = 0; i < originalElements.length; i++) {
        newElements.splice(newElements.length, 0, originalElements[i]);        
      }
    }
  }
}