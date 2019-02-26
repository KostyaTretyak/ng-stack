import { Injectable } from '@angular/core';
import { FormBuilder, AbstractControlOptions, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

import { FbControlsConfig, FbControlFormState, ObjectAny, FbControlReturns } from './types';
import { FormGroupTyped } from './form-group-typed';
import { FormControlTyped } from './form-control-typed';

@Injectable({ providedIn: 'root' })
export class FormBuilderTyped extends FormBuilder {
  group<T extends ObjectAny>(
    controlsConfig: FbControlsConfig<T>,
    options: AbstractControlOptions | ObjectAny | null = null
  ) {
    return super.group(controlsConfig, options) as FormGroupTyped<T>;
  }

  control<T, K>(
    formState: FbControlFormState<T, K>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    return super.control(formState, validatorOrOpts, asyncValidator) as FormControlTyped<FbControlReturns<T, K>>;
  }
}
