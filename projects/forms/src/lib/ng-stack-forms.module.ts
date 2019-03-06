import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormBuilder } from './form-builder';

@NgModule({
  exports: [ReactiveFormsModule],
  providers: [FormBuilder],
})
export class NgStackFormsModule {}
