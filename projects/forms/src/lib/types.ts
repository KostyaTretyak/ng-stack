import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { FormArrayTyped as FormArray } from './form-array-typed';
import { FormGroupTyped as FormGroup } from './form-group-typed';
import { FormControlTyped as FormControl } from './form-control-typed';

export interface ObjectAny {
  [key: string]: any;
}

export type StringKeys<T> = Extract<keyof T, string>;

export type ControlType<T> = T extends (infer Item)[]
  ? FormArray<Item>
  : T extends object
  ? T extends Control<T>
    ? FormControl<T>
    : FormGroup<T>
  : FormControl<T>;

export type FormBuilderControl<T> =
  | T
  | [T, (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
  | FormControl<T>;

/**
 * Form builder control config.
 */
export type FbControlsConfig<T> = T extends (infer Item)[]
  ? FormArray<Item>
  : T extends object
  ? FormGroup<T>
  : FormBuilderControl<T>;

/**
 * Form builder control state.
 */
export type FbControlFormState<T, K> = K extends StringKeys<T> ? T[K] | { value: T[K]; disabled: boolean } : any;

/**
 * Form builder control returns.
 */
export type FbControlReturns<T, K> = K extends StringKeys<T> ? T[K] : any;

export interface UpdateValueOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
}

export interface LegacyControlOptions {
  validator: ValidatorFn | ValidatorFn[] | null;
  asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null;
}

/**
 * This type is needed to distinguish `FormControl` and `FormGroup`
 * if both of them are presented as an object in a form model.
 * 
 * ### Example:
 * 
```ts
import { Control, FormGroup } from '@ng-stack/forms';

class Address {
  city: string;
  street: string;
}

class Other {
  children: number;
}

class Profile {
  firstName: string;
  lastName: string;
  address: Control<Address>;
  other: Other;
}

let formGroup: FormGroup<Profile>;
formGroup.get('firstName'); // FormControl
formGroup.get('address'); // FormControl
formGroup.get('other'); // FormGroup
```
 */
export type Control<T> = T & UniqToken;

export class UniqToken {
  private readonly ControlDef: never;
}
