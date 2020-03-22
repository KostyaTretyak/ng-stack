import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgStackFormsModule } from '@ng-stack/forms';
import { ContenteditableModule } from '@ng-stack/contenteditable';

import { ApiMockRoutingModule } from './api-mock-routing.module';
import { ApiMockComponent } from './pages/api-mock/api-mock.component';
import { SimpleComponent } from './pages/simple/simple.component';
import { PostsComponent } from './pages/posts/posts.component';
import { EditSimpleComponent } from './pages/edit-simple/edit-simple.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ApiMockComponent, SimpleComponent, PostsComponent, EditSimpleComponent],
  imports: [CommonModule, ApiMockRoutingModule, NgStackFormsModule, ReactiveFormsModule, ContenteditableModule],
})
export class ApiMockModule {}
