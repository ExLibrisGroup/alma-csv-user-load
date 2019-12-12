import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { SettingsService } from '../services/settings.service';
import { Utils } from '../utilities';
import { ProfileComponent } from './profile/profile.component';

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
  @ViewChild(ProfileComponent, null) profileForm: ProfileComponent;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) { }

  ngOnInit() {
    this.initForm();
    this.setProfile();
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
      fields: this.fb.array([
        this.fb.group({
          header: '',
          default: 'INTERNAL',
          fieldName: 'account_type.value'
        })
      ])  
    })
  }

  load() {
    this.settingsService.getAsFormGroup().subscribe((settings: FormGroup) => {
      if (!Utils.isEmptyObject(settings.value)) this.form = settings;
      else this.initForm();

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

  onProfileSelected(event: MatSelectChange) {
    this.profileForm.form = event.source.value;
  }  

  setProfile(index = 0) {
    this.selectedProfile = this.profiles.at(index) as FormGroup;
    this.profileForm.form = this.selectedProfile;
  }

  addProfile() {
    let name = prompt('Profile name');
    this.profiles.push(this.newProfile(name));
    this.setProfile(this.profiles.length-1);
    this.form.markAsDirty();
  }

  deleteProfile() {
    if (confirm('Are you sure you want to delete this profile?')) {
      this.profiles.removeAt(this.profiles.controls.findIndex( p => this.compareProfiles(p, this.selectedProfile)))
      this.setProfile();
      this.form.markAsDirty();
    }
  }

  renameProfile() {
    console.log('rename');
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
  /* Account type required */
  if (fields.length===0 || !fields.value.some(f=>f['fieldName']=='account_type.value')) 
    errorArray.push('Account type field is required');

  /* Address type required */
  if (fields.value.some(f=>f['fieldName'].startsWith('contact_info.address'))
    && !fields.value.some(f=>f['fieldName']=='contact_info.address[].address_type[].value'))  
    errorArray.push('Address type required');

  return errorArray.length>0 ? errorArray : null;
}

/** Validate entire form */
const validateForm = (form: FormGroup) : string[] | null => {
  let errorArray = [];
  let profiles = form.get('profiles') as FormArray;

  /* All fields must have either a default or a header */
  profiles.controls.forEach( p => {
    let fields = p.get('fields');
    if ( fields.value.filter(f=>!f['header'] && !f['default']).length>0)
      errorArray.push(`Each field in profile '${p.get('name').value}' must have either a default or a header value.`);
  })

  return errorArray.length>0 ? errorArray : null;
}