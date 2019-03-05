import { Injectable } from '@angular/core';
import { FormBuilder, AbstractControlOptions, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

import { FbControlsConfig, LegacyControlOptions } from './types';
import { FormGroupTyped as FormGroup } from './form-group-typed';
import { FormControlTyped as FormControl } from './form-control-typed';
import { FormArrayTyped as FormArray } from './form-array-typed';

@Injectable()
export class FormBuilderTyped extends FormBuilder {
  /**
   * Construct a new `FormGroup` instance.
   *
   * @param controlsConfig A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormGroup`. The object can
   * have two shapes:
   *
   * 1) `AbstractControlOptions` object (preferred), which consists of:
   * - `validators`: A synchronous validator function, or an array of validator functions
   * - `asyncValidators`: A single async validator or array of async validator functions
   * - `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur' |
   * submit')
   *
   * 2) Legacy configuration object, which consists of:
   * - `validator`: A synchronous validator function, or an array of validator functions
   * - `asyncValidator`: A single async validator or array of async validator functions
   */
  group<T extends object = any>(
    controlsConfig: { [P in keyof T]?: FbControlsConfig<T[P]> },
    options: AbstractControlOptions | LegacyControlOptions | null = null
  ) {
    return super.group(controlsConfig, options) as FormGroup<T>;
  }

  /**
   * @description
   * Construct a new `FormControl` with the given state, validators and options.
   *
   * @param formState Initializes the control with an initial state value, or
   * with an object that contains both a value and a disabled status.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains
   * validation functions and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator
   * functions.
   *
   * ### Initialize a control as disabled
   *
   * The following example returns a control with an initial value in a disabled state.
```ts
import {Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// ...
@Component({
  selector: 'app-disabled-form-control',
  template: `
    <input [formControl]="control" placeholder="First">
  `
})
export class DisabledFormControlComponent {
  control: FormControl;

  constructor(private fb: FormBuilder) {
    this.control = fb.control({value: 'my val', disabled: true});
  }
}
```
   */
  control<T = any>(
    formState: T | { value: T; disabled: boolean } = null,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    return super.control(formState, validatorOrOpts, asyncValidator) as FormControl<T>;
  }

  /**
   * Constructs a new `FormArray` from the given array of configurations,
   * validators and options.
   *
   * @param controlsConfig An array of child controls or control configs. Each
   * child control is given an index when it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains
   * validation functions and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator
   * functions.
   */
  array<Item = any>(
    controlsConfig: FbControlsConfig<Item>[],
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    return super.array(controlsConfig, validatorOrOpts, asyncValidator) as FormArray<Item>;
  }
}
