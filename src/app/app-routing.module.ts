import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'contenteditable',
    loadChildren: () =>
      import('src/app/modules/routed/contenteditable/contenteditable.module').then(m => m.ContenteditableModule),
  },
  { path: 'forms', loadChildren: () => import('src/app/modules/routed/forms/forms.module').then(m => m.FormsModule) },
  {
    path: 'api-mock',
    loadChildren: () => import('src/app/modules/routed/api-mock/api-mock.module').then(m => m.ApiMockModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
