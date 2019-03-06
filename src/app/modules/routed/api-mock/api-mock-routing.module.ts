import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApiMockComponent } from './pages/api-mock/api-mock.component';

// Parent route '/api-mock'
const routes: Routes = [{ path: '', pathMatch: 'full', component: ApiMockComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApiMockRoutingModule {}
