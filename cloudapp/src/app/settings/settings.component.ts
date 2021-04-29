import { Component, OnInit, Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { isEmptyObject, tryParse, download } from '../utilities';
import { validateFields, validateForm } from '../models/settings-utils';
import { Observable, of } from 'rxjs';
import { CloudAppSettingsService, AlertService, FormGroupUtil } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogService } from 'eca-components';
import { Profile, validateProfiles } from '../models/settings';
import { DialogData } from 'eca-components/dialogs/dialog'; 

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  saving = false;
  submitted = false;
  selectedProfile: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private settingsService: CloudAppSettingsService,
    private translate: TranslateService,
    private alert: AlertService,
    private dialog: DialogService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
      profiles: this.fb.array([
        this.newProfile('Default')
      ])
    })
  }

  newProfile(name: string): FormGroup {
    return this.fb.group({
      name: name,
      accountType: "INTERNAL",
      profileType: "ADD",
      fields: this.fb.array([ ], validateFields)  
    });
  }

  load() {
    this.settingsService.getAsFormGroup().subscribe( settings => {
      if (!isEmptyObject(settings.value)) {
        (settings.get('profiles') as FormArray).controls.forEach((profile: FormGroup)=>{
          if (!profile.get('profileType')) profile.addControl('profileType', new FormControl('ADD'));
        })
        this.form = settings;
      }
      this.setProfile();
      this.profiles.controls.forEach( f => f.get('fields').setValidators(validateFields));
      this.form.setValidators(validateForm);
      this.form.updateValueAndValidity();
    });    
  }  

  save() {
    this.submitted = true;
    if (!this.form.valid) return;
    this.saving = true;
    this.settingsService.set(this.form.value).subscribe( response => {
      this.alert.success(this.translate.instant('Settings.Saved'));
      this.form.markAsPristine();
      this.submitted = false;
      this.saving = false;
    },
    err => this.alert.error(err.message));
  }

  reset() {
    this.load();
  }

  setProfile(index = 0) {
    this.selectedProfile = this.profiles.at(index) as FormGroup;
  }

  addProfile() {
    this.dialog.prompt({ prompt: _('Settings.ProfileName') })
    .subscribe( name => {
      if (!name) return;
      if (this.profiles.value.some(p=>p.name.toLowerCase() === name.toLowerCase())) {
        return this.dialog.alert({ text: [_('Settings.ProfileExists'), { name: name }]});
      } else {
        this.profiles.push(this.newProfile(name));
        this.setProfile(this.profiles.length-1);
        this.form.markAsDirty();  
      }
    })
  }

  deleteProfile() {
    this.dialog.confirm({ text: _('Settings.ConfirmDeleteProfile') })
    .subscribe( result => {
      if (!result) return;
      this.profiles.removeAt(this.profiles.controls.findIndex( p => this.compareProfiles(p, this.selectedProfile)))
      this.setProfile();
      this.form.markAsDirty();
    })
  }

  renameProfile() {
    this.dialog.prompt({ prompt: _('Settings.RenameProfile'), val: this.selectedProfile.value.name })
    .subscribe( name => {
      if (!!name) {
        this.selectedProfile.patchValue({name: name});
        this.form.markAsDirty();
      }
    })
  }

  readFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const file = event.target.result;
      this.importProfiles(file);
      (document.getElementById('file') as HTMLInputElement).value = null;
    };
    reader.onerror = event => console.error(event.target.error.name);
    reader.readAsText(file);
  }

  importProfiles = file => {
    if (typeof file != 'string') return;
    const profiles: Profile[] = tryParse(file);
    if (!profiles || !validateProfiles(profiles)) {
      this.alert.error(this.translate.instant('Settings.InvalidProfiles'));
      return;
    }
    const newProfiles = profiles.filter(profile=>!this.profiles.value.some(p=>p.name.toLowerCase() === profile.name.toLowerCase()));
    const replaceProfiles = profiles.filter(profile=>this.profiles.value.some(p=>p.name.toLowerCase() === profile.name.toLowerCase()));
    const data: DialogData = {
      text: [
        _('Settings.ConfirmImport'), 
        {
          countNew: newProfiles.length,
          new: newProfiles.map(p=>p.name).join(', '),
          countOverride: replaceProfiles.length,
          override: replaceProfiles.map(p=>p.name).join(', '),
          both: newProfiles.length > 0 && replaceProfiles.length > 0
        }
      ]
    }
    this.dialog.confirm(data).subscribe( result => {
      if (!result) return;
      newProfiles.forEach(profile => {
        this.profiles.push(FormGroupUtil.toFormGroup(profile));
        const index = this.profiles.length - 1;
        this.profiles.at(index).get('fields').setValidators(validateFields);
        this.setProfile(index);
      });
      replaceProfiles.forEach(profile => {
        const index = this.profiles.value.findIndex(p=>p.name===profile.name);
        this.profiles.removeAt(index);
        this.profiles.insert(index, FormGroupUtil.toFormGroup(profile));
        this.profiles.at(index).get('fields').setValidators(validateFields);
        this.setProfile(index);
      });
      this.form.markAsDirty();
    });
  }

  exportProfile() {
    download(`${this.selectedProfile.value.name}.json`, 'text/json', JSON.stringify([ this.selectedProfile.value ], null, 2));
  }

  exportProfiles() {
    download('profiles.json', 'text/json', JSON.stringify(this.profiles.value, null, 2));
  }

  compareProfiles(o1: AbstractControl, o2: AbstractControl): boolean {
    return o1 && o2 ? o1.get('name').value === o2.get('name').value : o1 === o2;
  }

  get profiles(): FormArray { return (this.form.get('profiles') as FormArray) }
  get formErrors() { return this.form.errors ? Object.values(this.form.errors) : null }

}

@Injectable({
  providedIn: 'root',
})
export class SettingsGuard implements CanDeactivate<SettingsComponent> {
  constructor(
    private dialog: DialogService,
  ) {}

  canDeactivate(component: SettingsComponent): Observable<boolean> {
    if(!component.form.dirty) return of(true);
    return this.dialog.confirm({ 
      text: _('Settings.Discard'),
      ok: _('Settings.DiscardOk')
    });
  }
}