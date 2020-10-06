import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule, getTranslateModule, LazyTranslateLoader } from '@exlibris/exl-cloudapp-angular-lib';
import { ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { TranslateICUParser } from 'ngx-translate-parser-plural-select';
import { TranslateModule, TranslateLoader, TranslateParser } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent, MainDialog } from './main/main.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './settings/profile/profile.component'

export function getToastrModule() {
   return ToastrModule.forRoot({
     positionClass: 'toast-top-right',
     timeOut: 2000
   });
 }

 export function getTranslateModuleWithICU() {
   return TranslateModule.forRoot({
     loader: {
       provide: TranslateLoader,
       useClass: (LazyTranslateLoader)
     },
     parser: {
       provide: TranslateParser,
       useClass: TranslateICUParser
     }
   });
 }

@NgModule({
   declarations: [
      AppComponent,
      MainComponent,
      SettingsComponent,
      ProfileComponent,
      MainDialog,
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
      NgxDropzoneModule,
      getTranslateModuleWithICU(),
   ],
   entryComponents: [
      MainDialog
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
