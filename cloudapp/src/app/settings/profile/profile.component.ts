import { Component, OnInit, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material/table';

@Component({
  selector: 'app-settings-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  displayedColumns = ['header', 'default', 'name', 'actions'];
  dataSource: MatTableDataSource<any>;
  @ViewChild('table', null) table: MatTable<any>;
  @Input() form: FormGroup;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.fields.controls);
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

  get fields() { return this.form ? (this.form.get('fields') as FormArray) : new FormArray([])}
  get accountType() { return this.form ? (this.form.get('accountType') as FormControl) : new FormControl('')}
  get profileType() { return this.form ? (this.form.get('profileType') as FormControl) : new FormControl('')}
}