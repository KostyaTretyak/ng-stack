import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { ControlFormState } from './types';

export class FormControlTyped<T = any> extends FormControl {
  readonly value: T;
  readonly valueChanges: Observable<T>;

  constructor(
    formState: ControlFormState<T> = null,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(formState, validatorOrOpts, asyncValidator);
  }

  setValue(
    value: T,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {}
  ) {
    return super.setValue(value, options);
  }

  patchValue(
    value: T,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {}
  ) {
    return super.patchValue(value, options);
  }

  reset(
    formState: ControlFormState<T> = null,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    return super.reset(formState, options);
  }
}
