import { Injectable }           from '@angular/core';
import { Observable }           from 'rxjs';
import { CanDeactivate,
         ActivatedRouteSnapshot,
         RouterStateSnapshot }  from '@angular/router';

import { SettingsComponent } from './settings.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<SettingsComponent> {

  canDeactivate(
    component: SettingsComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {

    // Allow synchronous navigation (`true`) if the form is unchanged
    if (!component.form || !component.form.dirty) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    //return component.dialogService.confirm('Discard changes?');
    return confirm('Loose changes?');
  }
}