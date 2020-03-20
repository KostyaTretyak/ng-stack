import { Injectable } from '@angular/core';
import { FormBuilder as NativeFormBuilder } from '@angular/forms';

import {
  FbControlConfig,
  LegacyControlOptions,
  AbstractControlOptions,
  ValidatorFn,
  AsyncValidatorFn,
  ValidatorsModel,
} from './types';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';
import { FormArray } from './form-array';

@Injectable()
export class FormBuilder extends NativeFormBuilder {
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
  group<T extends object = any, V extends object = ValidatorsModel>(
    controlsConfig: { [P in keyof T]: FbControlConfig<T[P], V> },
    options: AbstractControlOptions | LegacyControlOptions | null = null
  ): FormGroup<T, V> {
    return super.group(controlsConfig, options) as FormGroup<T, V>;
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
  control<T = any, V extends object = ValidatorsModel>(
    formState: T | { value: T; disabled: boolean } = null,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ): FormControl<T, V> {
    return super.control(formState, validatorOrOpts, asyncValidator) as FormControl<T, V>;
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
  array<Item = any, V extends object = ValidatorsModel>(
    controlsConfig: FbControlConfig<Item, V>[],
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ): FormArray<Item, V> {
    return super.array(controlsConfig, validatorOrOpts, asyncValidator) as FormArray<Item, V>;
  }
}
