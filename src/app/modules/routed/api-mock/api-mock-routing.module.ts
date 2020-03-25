import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApiMockComponent } from './pages/api-mock/api-mock.component';
import { SimpleComponent } from './pages/simple/simple.component';
import { PostsComponent } from './pages/posts/posts.component';
import { SimpleEditComponent } from './pages/simple-edit/simple-edit.component';

const routes: Routes = [
  // Parent route '/api-mock'
  {
    path: '',
    pathMatch: 'full',
    component: ApiMockComponent,
  },
  {
    path: 'simple',
    component: SimpleComponent,
  },
  {
    path: 'simple/edit/:id',
    component: SimpleEditComponent,
  },
  {
    path: 'posts',
    component: PostsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApiMockRoutingModule {}
