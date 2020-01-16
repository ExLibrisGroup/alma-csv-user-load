import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Utils } from '../utilities';
import { CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService
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
      fields: this.fb.array([ ])  
    })
  }

  load() {
    this.settingsService.getAsFormGroup().subscribe( settings => {
      if (!Utils.isEmptyObject(settings.value)) this.form = settings;
      this.setProfile();
      this.profiles.controls.forEach( f => f.get('fields').setValidators(this.validateFields));
      this.form.setValidators(this.validateForm);
      this.form.updateValueAndValidity();
    });    
  }  

  save() {
    this.submitted = true;
    if (!this.form.valid) return;
    this.saving = true;
    this.settingsService.set(this.form.value).subscribe( response => {
      this.toastr.success(this.translate.instant('Settings.Saved'));
      this.form.markAsPristine();
      this.submitted = false;
      this.saving = false;
    },
    err => this.toastr.error(err.message));
  }

  reset() {
    this.load();
  }

  setProfile(index = 0) {
    this.selectedProfile = this.profiles.at(index) as FormGroup;
  }

  addProfile() {
    let name = prompt(this.translate.instant('Settings.ProfileName'));
    if (name != null) {
      if (this.profiles.value.some(p=>p.name.toLowerCase() === name.toLowerCase())) {
        return alert(this.translate.instant('Settings.ProfileExists',{name: name}));
      } else {
        this.profiles.push(this.newProfile(name));
        this.setProfile(this.profiles.length-1);
        this.form.markAsDirty();  
      }
    }
  }

  deleteProfile() {
    if (confirm(this.translate.instant('Settings.ConfirmDeleteProfile'))) {
      this.profiles.removeAt(this.profiles.controls.findIndex( p => this.compareProfiles(p, this.selectedProfile)))
      this.setProfile();
      this.form.markAsDirty();
    }
  }

  renameProfile() {
    let name = prompt(this.translate.instant('Settings.RenameProfile'), this.selectedProfile.value.name);
    if (name != null) {
      this.selectedProfile.patchValue({name: name});
      this.form.markAsDirty();
    }
  }

  compareProfiles(o1: AbstractControl, o2: AbstractControl): boolean {
    return o1 && o2 ? o1.get('name').value === o2.get('name').value : o1 === o2;
  }

  get profiles(): FormArray { return (this.form.get('profiles') as FormArray) }
  get formErrors() { return this.form.errors ? Object.values(this.form.errors) : null }

  /** Validate appropriate combination of fields for CSV import profile */
  validateFields (fields: FormArray): string[] | null {
    let errorArray = [];

    /* Address type required */
    if (fields.value.some(f=>f['fieldName'].startsWith('contact_info.address'))
      && !fields.value.some(f=>f['fieldName']=='contact_info.address[].address_type[].value'))
      errorArray.push({code:'Settings.Validation.AddressTypeRequired'});

    /* Email type required */
    if (fields.value.some(f=>f['fieldName'].startsWith('contact_info.email'))
      && !fields.value.some(f=>f['fieldName']=='contact_info.email[].email_type[].value'))  
      errorArray.push({code:'Settings.Validation.EmailTypeRequired'});
      
    return errorArray.length>0 ? errorArray : null;
  }

  /** Validate entire form */
  validateForm (form: FormGroup) : string[] | null {
    let errorArray = [];
    let profiles = form.get('profiles') as FormArray;

    /* All fields must have a fieldName and either a default or a header */
    profiles.controls.forEach( p => {
      let fields = p.get('fields');
      if ( fields.value.some(f=>!f['fieldName']))
        errorArray.push({code:'Settings.Validation.FieldNameRequired', params:{profile:p.get('name').value}})
      if ( fields.value.some(f=>!f['header'] && !f['default']))
        errorArray.push({code:'Settings.Validation.HeaderRequired', params:{profile:p.get('name').value}})
    })

    return errorArray.length>0 ? errorArray : null;
  }
}