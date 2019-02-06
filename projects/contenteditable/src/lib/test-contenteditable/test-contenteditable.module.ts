import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContenteditableModule } from '@ng-stack/contenteditable';

import { TestContenteditableComponent } from './test-contenteditable/test-contenteditable.component';

@NgModule({
  declarations: [TestContenteditableComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContenteditableModule
  ],
  exports: [TestContenteditableComponent]
})
export class TestContenteditableModule { }
