import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsComponent } from './pages/forms.component';

// Parent route: '/forms'
const routes: Routes = [{ path: '', pathMatch: 'full', component: FormsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormsRoutingModule {}
