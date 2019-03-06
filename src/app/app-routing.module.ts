import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'forms', loadChildren: 'src/app/modules/routed/forms/forms.module#FormsModule' },
  { path: 'api-mock', loadChildren: 'src/app/modules/routed/api-mock/api-mock.module#ApiMockModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
