import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContenteditableComponent } from './pages/contenteditable/contenteditable.component';

// Parent route '/contenteditable'
const routes: Routes = [{ path: '', pathMatch: 'full', component: ContenteditableComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContenteditableRoutingModule {}
