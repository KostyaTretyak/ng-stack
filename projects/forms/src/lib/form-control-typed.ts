import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { OnlyStringKeyOf, ControlFormState, ControlType, ObjectAny } from './types';

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

  get<K extends OnlyStringKeyOf<T>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
  }

  setValue(value: T, options?: ObjectAny) {
    return super.setValue(value, options);
  }

  patchValue(value: Partial<T>, options?: ObjectAny) {
    return super.patchValue(value, options);
  }

  reset(value?: T, options?: ObjectAny) {
    return super.reset(value, options);
  }
}
