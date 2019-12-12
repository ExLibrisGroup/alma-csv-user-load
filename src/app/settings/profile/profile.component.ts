import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material';


@Component({
  selector: 'app-settings-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
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

  get fields() { return (this.form.get('fields') as FormArray) }


}