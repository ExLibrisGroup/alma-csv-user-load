import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { Utils } from '../utilities';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  status: string;
  submitted = false;
  selectedProfile: FormGroup;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) { }

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
    this.settingsService.getAsFormGroup().subscribe((settings: FormGroup) => {
      if (!Utils.isEmptyObject(settings.value)) this.form = settings;

      this.setProfile();
      this.profiles.controls.forEach( f => f.get('fields').setValidators(validateFields));
      this.form.setValidators(validateForm);
      this.form.updateValueAndValidity();
    });    
  }

  async save() {
    this.submitted = true;
    if (!this.form.valid) return;
    this.status = 'Saving...'
    await this.settingsService.set(this.form.value).toPromise();
    this.status = 'Saved'; setInterval(()=>this.status='',1500);
    this.form.markAsPristine();
    this.submitted = false;
  }

  reset() {
    this.load();
  }

  setProfile(index = 0) {
    this.selectedProfile = this.profiles.at(index) as FormGroup;
  }

  addProfile() {
    let name = prompt('Profile name');
    if (name != null) {
      if (this.profiles.value.some(p=>p.name.toLowerCase() === name.toLowerCase())) {
        return alert(`Profile "${name}" already exists.`)
      } else {
        this.profiles.push(this.newProfile(name));
        this.setProfile(this.profiles.length-1);
        this.form.markAsDirty();  
      }
    }
  }

  deleteProfile() {
    if (confirm('Are you sure you want to delete this profile?')) {
      this.profiles.removeAt(this.profiles.controls.findIndex( p => this.compareProfiles(p, this.selectedProfile)))
      this.setProfile();
      this.form.markAsDirty();
    }
  }

  renameProfile() {
    let name = prompt('Rename profile', this.selectedProfile.value.name);
    if (name != null) {
      this.selectedProfile.patchValue({name: name});
      this.form.markAsDirty();
    }
  }

  compareProfiles(o1: AbstractControl, o2: AbstractControl): boolean {
    return o1 && o2 ? o1.get('name').value === o2.get('name').value : o1 === o2;
  }

  get profiles(): FormArray { return (this.form.get('profiles') as FormArray) }
  get formErrors() { return Object.values(this.form.errors) }

  // https://stackblitz.com/edit/angular-material-table-with-form-59imvq

}

/** Validate appropriate combination of fields for CSV import profile */
const validateFields = (fields: FormArray): string[] | null => {
  let errorArray = [];

  /* Address type required */
  if (fields.value.some(f=>f['fieldName'].startsWith('contact_info.address'))
    && !fields.value.some(f=>f['fieldName']=='contact_info.address[].address_type[].value'))  
    errorArray.push('Address type required');

  /* Email type required */
  if (fields.value.some(f=>f['fieldName'].startsWith('contact_info.email'))
    && !fields.value.some(f=>f['fieldName']=='contact_info.email[].email_type[].value'))  
    errorArray.push('Email type required');
    
  return errorArray.length>0 ? errorArray : null;
}

/** Validate entire form */
const validateForm = (form: FormGroup) : string[] | null => {
  let errorArray = [];
  let profiles = form.get('profiles') as FormArray;

  /* All fields must have a fieldName and either a default or a header */
  profiles.controls.forEach( p => {
    let fields = p.get('fields');
    if ( fields.value.some(f=>!f['fieldName']))
      errorArray.push(`Each field in profile '${p.get('name').value}' must have a field name.`)
    if ( fields.value.some(f=>!f['header'] && !f['default']))
      errorArray.push(`Each field in profile '${p.get('name').value}' must have either a default or a header value.`);
  })

  return errorArray.length>0 ? errorArray : null;
}