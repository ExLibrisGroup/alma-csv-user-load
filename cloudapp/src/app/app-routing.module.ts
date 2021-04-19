import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent, MainGuard } from './main/main.component';
import { SettingsComponent, SettingsGuard } from './settings/settings.component';

const routes: Routes = [
  { path: '', component: MainComponent, canActivate: [MainGuard]},
  { path: 'settings', component: SettingsComponent, canDeactivate: [SettingsGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
