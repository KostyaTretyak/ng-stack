import { AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { FormArray } from './form-array';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';

/**
 * This type marks a property of a form model as property
 * which is intended for an instance of `FormControl`.
 * 
 * If a property of your form model have a primitive type,
 * in appropriate form field the instance of `FormControl` will be automatically assigned.
 * But if the property have a type that extends `object` - you need `Control<T>`.
 * 
 * ### Example:
```ts
import { FormBuilder, Control } from '@ng-stack/forms';

const fb = new FormBuilder();

// Form Model
interface Person {
  id: number;
  name: string;
  birthDate: Control<Date>; // Here should be FormControl, instead of a FormGroup
}

const form = fb.group<Person>({
  id: 123,
  name: 'John Smith',
  birthDate: new Date(1977, 6, 30),
});

const birthDate: Date = form.value.birthDate;
```
 */
export type Control<T extends object> = T & UniqToken;

const sym = Symbol();

interface UniqToken {
  [sym]: never;
}

/**
 * Extract `keyof T` with string keys.
 */
export type StringKeys<T> = Extract<keyof T, string>;

type ExtractAny<T> = T extends Extract<T, string & number & boolean & object & null & undefined> ? any : never;

/**
 * This type is a conditional type that automatically detects
 * appropriate types for form controls by given type for its generic.
 */
export type ControlType<T, V extends object = ValidatorsModel> = [T] extends [ExtractAny<T>]
  ? FormGroup<any, V> | FormControl<any, V> | FormArray<any, V>
  : [T] extends [Array<infer Item>]
  ? FormArray<Item, V>
  : [T] extends [Control<infer ControlModel>]
  ? FormControl<ControlModel, V>
  : [T] extends [object]
  ? FormGroup<T, V>
  : FormControl<T, V>;

/**
 * Form builder control config.
 */
export type FbControlConfig<T, V extends object = ValidatorsModel> = [T] extends [ExtractAny<T>]
  ? FormGroup<any, V> | FbControl<any, V> | FormArray<any, V>
  : [T] extends [Array<infer Item>]
  ? FormArray<Item, V>
  : [T] extends [Control<infer ControlModel>]
  ? FbControl<ControlModel, V>
  : [T] extends [object]
  ? FormGroup<T, V>
  : FbControl<T, V>;

/**
 * Form builder control.
 */
export type FbControl<T, V extends object = ValidatorsModel> =
  | T
  | [T, (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
  | FormControl<T, V>;

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
  min: { min: number; actual: number };
  max: { max: number; actual: number };
  required: true;
  email: true;
  minlength: { requiredLength: number; actualLength: number };
  maxlength: { requiredLength: number; actualLength: number };
  pattern: { requiredPattern: string; actualValue: string };
  fileRequired: { requiredSize: number; actualSize: number; file: File };
  filesMinLength: { requiredLength: number; actualLength: number };
  filesMaxLength: { requiredLength: number; actualLength: number };
  fileMaxSize: { requiredSize: number; actualSize: number; file: File };
}
