import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormBuilderTyped as FormBuilder } from './form-builder-typed';

@NgModule({
  imports: [ReactiveFormsModule],
  providers: [FormBuilder],
})
export class NgStackFormsModule {}
