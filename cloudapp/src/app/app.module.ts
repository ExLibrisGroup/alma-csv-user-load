import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MaterialModule, getTranslateModule, LazyTranslateLoader, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateICUParser } from 'ngx-translate-parser-plural-select';
import { TranslateModule, TranslateLoader, TranslateParser } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent, MainDialog } from './main/main.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './settings/profile/profile.component'
import { DialogModule } from 'eca-components';

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
      AlertModule,
      DialogModule,
      BrowserAnimationsModule,
      NgxDropzoneModule,
      getTranslateModuleWithICU(),
   ],
   entryComponents: [
      MainDialog
   ],
   providers: [
      { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
