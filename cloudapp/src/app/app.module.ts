import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule, getTranslateModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './settings/profile/profile.component'

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
      MainComponent,
      SettingsComponent,
      ProfileComponent
   ],
   imports: [
      MaterialModule,
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      ReactiveFormsModule,
      getTranslateModule(),
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
