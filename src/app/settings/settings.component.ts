import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material';
import { SettingsService } from '../services/settings.service';
import { Utils } from 'src/utilities';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  displayedColumns = ['header', 'default', 'name', 'actions'];
  dataSource: MatTableDataSource<any>;
  form: FormGroup;
  status: string;
  submitted = false;
  @ViewChild('table', null) table: MatTable<any>;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) { }

  ngOnInit() {
    this.initForm();
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
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
      
      this.dataSource = new MatTableDataSource(this.fields.controls);
      this.fields.setValidators(validateFields);
      this.form.setValidators(validateForm);
      this.form.updateValueAndValidity();
    });
  }

  addField() {
    this.fields.push(this.fb.group({header: '', fieldName: '', default: ''}));
    this.fields.markAsDirty();
    this.table.renderRows();
  }

  removeField(index: number) {
    this.fields.removeAt(index);
    this.fields.markAsDirty();
    this.table.renderRows();
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

  get fields() { return (this.form.get('fields') as FormArray) }
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
  let fields = form.get('fields');

  /* All fields must have either a default or a header */
  if ( fields.value.filter(f=>!f['header'] && !f['default']).length>0)
    errorArray.push('Each field must have either a default or a header value.');

  return errorArray.length>0 ? errorArray : null;
}