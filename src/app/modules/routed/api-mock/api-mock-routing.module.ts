import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApiMockComponent } from './pages/api-mock/api-mock.component';
import { SimpleComponent } from './pages/simple/simple.component';
import { PostsComponent } from './pages/posts/posts.component';
import { SimpleEditComponent } from './pages/simple-edit/simple-edit.component';
import { ApiPostsResolverService } from 'src/app/services/api/posts/api-posts-resolver.service';
import { PostReadComponent } from './pages/post-read/post-read.component';

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
    resolve: {
      postListRes: ApiPostsResolverService,
    },
  },
  {
    path: 'posts/:postId',
    component: PostReadComponent,
    resolve: {
      postRes: ApiPostsResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApiMockRoutingModule {}
