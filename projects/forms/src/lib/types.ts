import { AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { FormArray } from './form-array';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';
import { Validators } from './validators';

export type StringKeys<T> = Extract<keyof T, string>;

export type ControlType<T> = T extends (infer Item)[]
  ? T extends [infer ControlModel, UniqToken]
    ? FormControl<ControlModel>
    : FormArray<Item>
  : T extends object
  ? FormGroup<T>
  : FormControl<T>;

export type FormBuilderControl<T, E extends object> =
  | T
  | [
      T,
      (ValidatorFn<E> | ValidatorFn<E>[] | AbstractControlOptions<E>)?,
      (AsyncValidatorFn<E> | AsyncValidatorFn<E>[])?
    ]
  | FormControl<T>;

/**
 * Form builder control config.
 */
export type FbControlsConfig<T, E extends object> = T extends (infer Item)[]
  ? T extends [infer ControlModel, UniqToken]
    ? FormBuilderControl<ControlModel, E>
    : FormArray<Item>
  : T extends object
  ? FormGroup<T>
  : FormBuilderControl<T, E>;

export interface LegacyControlOptions<E extends object> {
  validator: ValidatorFn<E> | ValidatorFn<E>[] | null;
  asyncValidator: AsyncValidatorFn<E> | AsyncValidatorFn<E>[] | null;
}

export type Control<T extends object> = [T, UniqToken];

const sym = Symbol();

interface UniqToken {
  [sym]: never;
}

/**
 * The validation status of the control. There are four possible
 * validation status values:
 *
 * * **VALID**: This control has passed all validation checks.
 * * **INVALID**: This control has failed at least one validation check.
 * * **PENDING**: This control is in the midst of conducting a validation check.
 * * **DISABLED**: This control is exempt from validation checks.
 *
 * These status values are mutually exclusive, so a control cannot be
 * both valid AND invalid or invalid AND disabled.
 */
export type Status = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

/**
 * A function that receives a control and synchronously returns a map of
 * validation errors if present, otherwise null.
 */
export type ValidatorFn<T extends object = any> = (control: AbstractControl) => ValidationErrors<T> | null;

/**
 * A function that receives a control and returns a Promise or observable
 * that emits validation errors if present, otherwise null.
 */
export type AsyncValidatorFn<T extends object = any> = (
  control: AbstractControl
) => Promise<ValidationErrors<T> | null> | Observable<ValidationErrors<T> | null>;

/**
 * Defines the map of errors returned from failed validation checks.
 */
export type ValidationErrors<T extends object = any> = T;

/**
 * Interface for options provided to an `AbstractControl`.
 */
export interface AbstractControlOptions<T extends object = any> {
  /**
   * The list of validators applied to a control.
   */
  validators?: ValidatorFn<T> | ValidatorFn<T>[] | null;
  /**
   * The list of async validators applied to control.
   */
  asyncValidators?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null;
  /**
   * The event name for control to update upon.
   */
  updateOn?: 'change' | 'blur' | 'submit';
}

/**
 * The default validators model, it includes almost all properties of `typeof Validators`,
 * excludes: `prototype`, `compose`, `composeAsync` and `nullValidator`.
 * 
 * ### Usage
 * 
```ts
const formControl = new FormControl<string, ValidatorsModel>('some value');
// OR
const formGroup = new FormGroup<any, ValidatorsModel>({});
// OR
const formArray = new FormArray<any, ValidatorsModel>([]);
```
 */
export class ValidatorsModel {
  min: { min: { min: number; actual: number } };
  max: { max: { max: number; actual: number } };
  required: { required: true };
  requiredTrue: { required: true };
  email: { email: true };
  minLength: { minlength: { requiredLength: number; actualLength: number } };
  maxLength: { requiredLength: number; actualLength: number };
  pattern: { requiredPattern: string; actualValue: string };
}
// export type ValidatorsModel = {
//   [P in Exclude<keyof typeof Validators, ExcludedProps>]: typeof Validators[P] extends (...args: any[]) => infer Err
//     ? Err extends (...args: any[]) => infer Sync
//       ? Sync extends (Promise<infer Async> | Observable<infer Async>)
//         ? Async
//         : Sync
//       : Err
//     : null
// };

type ExcludedProps = 'prototype' | 'compose' | 'composeAsync' | 'nullValidator';
