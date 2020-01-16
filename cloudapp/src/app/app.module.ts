import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule, getTranslateModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './settings/profile/profile.component'

export function getToastrModule() {
   return ToastrModule.forRoot({
     positionClass: 'toast-top-right',
     timeOut: 2000
   });
 }

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
      getToastrModule(),
      BrowserAnimationsModule,
      NgxDropzoneModule   
   ],
   providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
