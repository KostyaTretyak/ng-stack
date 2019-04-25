import { AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { FormArray } from './form-array';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';

/**
 * Extract `keyof T` with string keys.
 */
export type StringKeys<T> = Extract<keyof T, string>;

/**
 * This type marks a property of a form model as property
 * which is intended for an instance of `FormControl`.
 * 
 * If a property of your form model have a primitive type,
 * for it, the instance of `FormControl` will be automatically assigned.
 * But if the property have a type that extends `object` - you need `Control<T>`.
 * 
 * ### Example:
```ts
import { FormControl, Control, FormGroup } from '@ng-stack/forms';

// Form model
class Address {
  city: string;
  street: string;
  zip: string;
  other: Control<Other>; // Here should be FormControl, instead of FormGroup
}

// Form model
class Other {
  prop1: string;
  prop2: number;
}

const formGroup = new FormGroup<Address>({
  other: new FormControl({ prop1: 'value for prop1', prop2: 123 }), // OK
});
```
 */
export type Control<T extends object> = [T, UniqToken];

const sym = Symbol();

interface UniqToken {
  [sym]: never;
}

type ExtractAny<T> = T extends Extract<T, string & number & boolean & object & null & undefined> ? any : never;

/**
 * This type is a conditional type that automatically detects
 * appropriate types for form controls by given type for its generic.
 */
export type ControlType<T> = [T] extends [ExtractAny<T>]
  ? (FormGroup<any> | FormControl<any> | FormArray<any>)
  : [T] extends [Array<infer Item>]
  ? T extends [infer ControlModel, UniqToken]
    ? FormControl<ControlModel>
    : FormArray<Item>
  : [T] extends [object]
  ? FormGroup<T>
  : FormControl<T>;

/**
 * Form builder control config.
 */
export type FbControlConfig<T> = [T] extends [ExtractAny<T>]
  ? (FormGroup<any> | FbControl<any> | FormArray<any>)
  : [T] extends [Array<infer Item>]
  ? T extends [infer ControlModel, UniqToken]
    ? FbControl<ControlModel>
    : FormArray<Item>
  : [T] extends [object]
  ? FormGroup<T>
  : FbControl<T>;

/**
 * Form builder control.
 */
export type FbControl<T> =
  | T
  | [T, (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
  | FormControl<T>;

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
 * Form builder legacy control options.
 */
export interface LegacyControlOptions {
  validator: ValidatorFn | ValidatorFn[] | null;
  asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null;
}

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
  fileRequired: { requiredSize: number; actualSize: number; file: File };
  filesMinLength: { requiredLength: number; actualLength: number };
  filesMaxLength: { requiredLength: number; actualLength: number };
  fileMaxSize: { requiredSize: number; actualSize: number; file: File };
}
