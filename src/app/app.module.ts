import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { NgxDropzoneModule } from 'ngx-dropzone';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CsvUserLoadComponent } from './csv-user-load/csv-user-load.component';
import { ProfileComponent } from './settings/profile/profile.component'
import { SettingsComponent } from './settings/settings.component';

import {
   MatInputModule, 
   MatFormFieldModule,
   MatButtonModule,
   MatTableModule,
   MatSelectModule,
   MatExpansionModule,
   MatIconModule,
   MatProgressSpinnerModule
} from '@angular/material'

@NgModule({
   declarations: [
      AppComponent,
      TopMenuComponent,
      CsvUserLoadComponent,
      SettingsComponent,
      ProfileComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      ReactiveFormsModule,
      BrowserAnimationsModule,
      NgxDropzoneModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatTableModule,
      MatSelectModule,
      MatExpansionModule,
      MatIconModule,
      MatProgressSpinnerModule
   ],
   providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
