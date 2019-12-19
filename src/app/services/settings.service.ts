import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { Utils } from '../utilities';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private settings$: Observable<any>;

  constructor( private http: HttpClient ) { }

  get settings(): Observable<any> {
    if (!this.settings$) 
      this.settings$ = this.retrieveSettings().pipe(shareReplay());

    return this.settings$;
  }

  retrieveSettings() {
    const url = environment.settingsService + `?user_id=${environment.userId}&app_id=${environment.appId}`;
    return this.http.get<any>(url);
  }

  getAsFormGroup(): Observable<any> {
    return this.settings.pipe(map(settings => asFormGroup(settings)));
  }

  set(settings: Object): Observable<any> {
    this.settings$ = null;
    const url = environment.settingsService;
    return this.http.post(url, { userId: environment.userId, appId: environment.appId, settings: settings});
  }

}

const asFormGroup = (object: Object): AbstractControl => {
  if (Array.isArray(object)) {
    return new FormArray(object.map(entry=>asFormGroup(entry)));
  } else if (typeof object === 'object' && object != null) {
    return new FormGroup(Utils.mapObject(object, asFormGroup));
  } else {
    return new FormControl(object);
  }
}