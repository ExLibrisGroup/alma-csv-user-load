import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CsvUserLoadComponent } from './csv-user-load/csv-user-load.component';
import { SettingsComponent } from './settings/settings.component';


const routes: Routes = [
  { path: '', component: CsvUserLoadComponent},
  { path: 'settings', component: SettingsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
