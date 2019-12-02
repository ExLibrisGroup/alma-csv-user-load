import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { Utils } from 'src/utilities';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _settings: string;

  constructor( private http: HttpClient ) { }

  get(): Observable<any> {
    const url = environment.settingsService + `?user_id=joshw&app_id=exlcodeshare/test`;
    return this.http.get(url);
  }

  getAsFormGroup(): Observable<any> {
    return this.get().pipe(map(settings => asFormGroup(settings)))
  }

  set(settings: Object): Observable<any> {
    const url = environment.settingsService;
    return this.http.post(url, { userId: environment.userId, appId: environment.appId, settings: settings});
  }

}

const asFormGroup = (object: Object): AbstractControl => {
  if (Array.isArray(object)) {
    return new FormArray(object.map(entry=>asFormGroup(entry)));
  } else if (typeof object === 'object') {
    return new FormGroup(Utils.objectMap(object, asFormGroup));
  } else {
    return new FormControl(object);
  }
}