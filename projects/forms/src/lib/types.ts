import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { FormArrayTyped } from './form-array-typed';
import { FormGroupTyped } from './form-group-typed';
import { FormControlTyped } from './form-control-typed';

export interface ObjectAny {
  [key: string]: any;
}

export type StringKeys<T> = Extract<keyof T, string>;

export type ControlType<T> = T extends (infer Item)[]
  ? FormArrayTyped<Item>
  : T extends object
  ? T extends FormControlObject<T>
    ? FormControlTyped<T>
    : FormGroupTyped<T>
  : FormControlTyped<T>;

export type FormBuilderControl<T> =
  | T
  | [T, (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
  | FormControlTyped<T>;

/**
 * Form builder control config.
 */
export type FbControlsConfig<T> = T extends (infer Item)[]
  ? FormArrayTyped<Item>
  : T extends object
  ? FormGroupTyped<T>
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
import { FormControlObject } from '@ng-stack/forms';

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
  address: FormControlObject<Address>;
  other: Other;
}

let formGroup: FormGroupTyped<Profile>;
formGroup.get('firstName'); // FormControl
formGroup.get('address'); // FormControl
formGroup.get('other'); // FormGroup
```
 */
export type FormControlObject<T> = T & UniqToken;

export class UniqToken {
  private readonly FormControlObjectDef: never;
}
