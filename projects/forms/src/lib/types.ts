import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

export interface ObjectAny {
  [key: string]: any;
}

type OnlyStringKeyOf<T> = Extract<keyof T, string>;

type ControlType<T, K extends OnlyStringKeyOf<T>> = T[K] extends any[]
  ? FormArrayTyped<T[K]>
  : T[K] extends object
  ? FormGroupTyped<T[K]>
  : FormControlTyped<T[K]>;

type ControlFormState<T> = T extends object ? { value: T; disable: boolean } : T;

// Form builder control state
type FbControlFormState<T, K> = K extends OnlyStringKeyOf<T> ? T[K] | { value: T[K]; disabled: boolean } : any;

// Form builder control config
type FbControlsConfig<T> = {
  [P in OnlyStringKeyOf<T>]:
    | T[P]
    | [T[P], (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
};

// Form builder control returns
type FbControlReturns<T, K> = K extends OnlyStringKeyOf<T> ? T[K] : any;

interface UpdateValueOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
}

export abstract class AbstractControlTyped<T = any> extends AbstractControl {
  readonly value: T;
  readonly valueChanges: Observable<T>;

  get<K extends OnlyStringKeyOf<T>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
  }

  abstract setValue(value: T, options?: ObjectAny): void;
  abstract patchValue(value: Partial<T>, options?: ObjectAny): void;
  abstract reset(value?: T, options?: ObjectAny): void;
}

export class FormGroupTyped<T = ObjectAny> extends FormGroup {
  readonly value: T;
  readonly valueChanges: Observable<T>;

  constructor(
    public controls: { [K in OnlyStringKeyOf<T>]: ControlType<T, Extract<K, string>> },
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  registerControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlType<T, K>) {
    return super.registerControl(name, control) as ControlType<T, K>;
  }

  addControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlType<T, K>) {
    return super.addControl(name, control);
  }

  removeControl<K extends OnlyStringKeyOf<T>>(name: K) {
    return super.removeControl(name);
  }

  setControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlType<T, K>) {
    return super.setControl(name, control);
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

  getRawValue() {
    return super.getRawValue() as T;
  }

  get<K extends OnlyStringKeyOf<T>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
  }
}

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

export class FormArrayTyped<T = any> extends FormArray {
  constructor(
    public controls: ControlType<T, OnlyStringKeyOf<T>>[],
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  at<K extends OnlyStringKeyOf<T>>(index: number) {
    return super.at(index) as ControlType<T, K>;
  }

  push<K extends OnlyStringKeyOf<T>>(control: ControlType<T, K>) {
    return super.push(control);
  }

  insert<K extends OnlyStringKeyOf<T>>(index: number, control: ControlType<T, K>) {
    return super.insert(index, control);
  }

  setControl<K extends OnlyStringKeyOf<T>>(index: number, control: ControlType<T, K>) {
    return super.setControl(index, control);
  }

  setValue(value: T[], options: UpdateValueOptions = {}) {
    return super.setValue(value, options);
  }

  patchValue(value: T[], options: UpdateValueOptions = {}) {
    return super.patchValue(value, options);
  }

  reset(value: T[] = [], options: UpdateValueOptions = {}) {
    return super.reset(value, options);
  }

  getRawValue() {
    return super.getRawValue() as T[];
  }
}

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
