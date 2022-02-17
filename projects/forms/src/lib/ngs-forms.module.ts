import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormBuilder } from './form-builder';
import { InputFileDirective } from './input-file.directive';

@NgModule({
  declarations: [InputFileDirective],
  exports: [ReactiveFormsModule, InputFileDirective],
  providers: [FormBuilder],
})
export class NgsFormsModule {}
