import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ContenteditableModule as NgContenteditableModule } from '@ng-stack/contenteditable';

import { ContenteditableRoutingModule } from './contenteditable-routing.module';
import { ContenteditableComponent } from './pages/contenteditable/contenteditable.component';

@NgModule({
  declarations: [ContenteditableComponent],
  imports: [CommonModule, ContenteditableRoutingModule, FormsModule, ReactiveFormsModule, NgContenteditableModule],
})
export class ContenteditableModule {}
