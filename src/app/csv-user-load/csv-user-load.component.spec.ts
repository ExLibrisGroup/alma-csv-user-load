/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CsvUserLoadComponent } from './csv-user-load.component';

describe('CsvUserLoadComponent', () => {
  let component: CsvUserLoadComponent;
  let fixture: ComponentFixture<CsvUserLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvUserLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvUserLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
