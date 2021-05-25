/* tslint:disable:no-unused-variable */
/// <reference path="../../testing/custom-matcher.d.ts"/>
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CustomMatchers } from '../../testing/custom-matcher';

import { of } from 'rxjs';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { MaterialModule, getTranslateModule } from '@exlibris/exl-cloudapp-angular-lib';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { DialogModule, DialogService } from 'eca-components';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let compiled: HTMLElement;
  let spy: jasmine.Spy;
  let dialogService: DialogService;

  const settingsService = {
    getAsFormGroup: () => of(new FormGroup({}))
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        BrowserAnimationsModule,
        RouterTestingModule,
        MaterialModule,
        getTranslateModule(),
        ReactiveFormsModule,
        DialogModule,
      ],
      declarations: [ 
        SettingsComponent,
        ProfileComponent,
      ],
      providers: [ 
        { provide: CloudAppSettingsService, useValue: settingsService },
        DialogService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement.nativeElement;

    dialogService = fixture.debugElement.injector.get(DialogService);
    fixture.detectChanges();
  });

  beforeAll(() => {
    jasmine.addMatchers(CustomMatchers);
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add new profile on import', () => {
    spy = spyOn(dialogService, 'confirm').and.returnValue(of(true));
    component.importProfiles(NEW_PROFILE);
    expect(component.profiles.value.length).toBe(3);
    expect(component.profiles.value).toContainObject({ name: 'Default New One' })
  });

  it('should display confirmation on import new profile', () => {
    spy = spyOn(dialogService, 'confirm').and.callFake( data => {
      expect(data.text.length).toBe(2)
      expect(data.text[1].countNew).toBe(2);
      return of(true);
    })
    component.importProfiles(NEW_PROFILE);
    expect(spy).toHaveBeenCalled()
  })

  it('should display confirmation on import existing profile', () => {
    spy = spyOn(dialogService, 'confirm').and.callFake( data => {
      expect(data.text.length).toBe(2);
      expect(data.text[1].countOverride).toBe(1);
      return of(true);
    })
    component.importProfiles(REPLACE_PROFILE);
    expect(spy).toHaveBeenCalled()
  })

  it('should update existing profile on import', () => {
    spy = spyOn(dialogService, 'confirm').and.returnValue(of(true));
    component.importProfiles(REPLACE_PROFILE);
    expect(component.profiles.value.length).toBe(1);
    expect(component.profiles.value[0].fields).toContainObject({ fieldName: "user_group.value" })
  })

  it('should be invalid if missing type', () => {
    expect(component.form.valid).toBeTrue();
    (component.profiles.controls[0].get('fields') as FormArray)
      .push(new FormGroup({
        header: new FormControl('Email'),
        fieldName: new FormControl('contact_info.email[].email_address'),
        default: new FormControl('')
      }));
    expect(component.form.valid).toBeFalse();
  })

  it('should be invalid if missing primary ID', () => {
    expect(component.form.valid).toBeTrue();
    (component.profiles.controls[0] as FormGroup)
      .patchValue({ profileType: "UPDATE" });
    expect(component.form.valid).toBeFalse();
  })
})

/* Profile Exports */
const NEW_PROFILE = `
[
  {
    "name": "Default New One",
    "accountType": "INTERNAL",
    "profileType": "ADD",
    "fields": [
      {
        "header": "First Name",
        "fieldName": "first_name",
        "default": ""
      },
      {
        "header": "Last Name",
        "fieldName": "last_name",
        "default": ""
      },
      {
        "header": "Email",
        "fieldName": "contact_info.email[].email_address",
        "default": ""
      }
    ]
  },
  {
    "name": "Default New Two",
    "accountType": "INTERNAL",
    "profileType": "UPDATE",
    "fields": [
      {
        "header": "First Name",
        "fieldName": "first_name",
        "default": ""
      },
      {
        "header": "Last Name",
        "fieldName": "last_name",
        "default": ""
      },
      {
        "header": "User Group",
        "fieldName": "user_group.value",
        "default": ""
      }
    ]
  }
]`;

const REPLACE_PROFILE = `
[
  {
    "name": "Default",
    "accountType": "EXTERNAL",
    "profileType": "ADD",
    "fields": [
      {
        "header": "First Name",
        "fieldName": "first_name",
        "default": ""
      },
      {
        "header": "Last Name",
        "fieldName": "last_name",
        "default": ""
      },
      {
        "header": "User Group",
        "fieldName": "user_group.value",
        "default": ""
      }
    ]
  }
]`;