import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  displayedColumns = ['header', 'name', 'actions'];
  dataSource: MatTableDataSource<any>;
  form: FormGroup;
  status: string;
  @ViewChild('table', null) table: MatTable<any>;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) { }

  ngOnInit() {
    this.form = this.fb.group({
      userType: ''
    })
    this.load();
  }

  load() {
    this.settingsService.getAsFormGroup().subscribe((settings: FormGroup) => {
      this.form = settings;
      this.dataSource = new MatTableDataSource(this.fields.controls);
    });
  }

  addField() {
    this.fields.push(this.fb.group({header: '', fieldName: ''}));
    this.fields.markAsDirty();
    this.table.renderRows();
  }

  removeField(index: number) {
    this.fields.removeAt(index);
    this.fields.markAsDirty();
    this.table.renderRows();
  }

  async save() {
    this.status = 'Saving...'
    await this.settingsService.set(this.form.value).toPromise();
    this.status = 'Saved'; setInterval(()=>this.status='',1500);
    this.form.markAsPristine();
  }

  reset() {
    this.load();
  }

  get fields() { return (this.form.get('fields') as FormArray) }

  // https://stackblitz.com/edit/angular-material-table-with-form-59imvq

}
