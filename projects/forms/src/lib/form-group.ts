import { FormGroup as NativeFormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import {
  Status,
  StringKeys,
  ValidatorFn,
  AsyncValidatorFn,
  ValidatorsModel,
  ValidationErrors,
  AbstractControlOptions,
  ControlType,
} from './types';

export class FormGroup<T extends object = any, E extends object = ValidatorsModel> extends NativeFormGroup {
  readonly value: T;
  readonly valueChanges: Observable<T>;
  readonly status: Status;
  readonly statusChanges: Observable<Status>;
  readonly errors: ValidationErrors<E> | null;

  /**
   * Creates a new `FormGroup` instance.
   *
   * @param controls A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   * @todo Chechout how to respect optional and require properties modifyers for the controls.
   */
  constructor(
    public controls: { [P in keyof T]?: ControlType<T[P]> },
    validatorOrOpts?: ValidatorFn<E> | ValidatorFn<E>[] | AbstractControlOptions<E> | null,
    asyncValidator?: AsyncValidatorFn<E> | AsyncValidatorFn<E>[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  /**
   * Registers a control with the group's list of controls.
   *
   * This method does not update the value or validity of the control.
   * Use [addControl](https://angular.io/api/forms/FormGroup#addControl) instead.
   *
   * @param name The control name to register in the collection
   * @param control Provides the control for the given name
   */
  registerControl<K extends StringKeys<T>>(name: K, control: ControlType<T[K]>) {
    return super.registerControl(name, control) as ControlType<T[K]>;
  }

  /**
   * Add a control to this group.
   *
   * This method also updates the value and validity of the control.
   *
   * @param name The control name to add to the collection
   * @param control Provides the control for the given name
   */
  addControl<K extends StringKeys<T>>(name: K, control: ControlType<T[K]>) {
    return super.addControl(name, control);
  }

  /**
   * Remove a control from this group.
   *
   * @param name The control name to remove from the collection
   */
  removeControl<K extends StringKeys<T>>(name: K) {
    return super.removeControl(name);
  }

  /**
   * Replace an existing control.
   *
   * @param name The control name to replace in the collection
   * @param control Provides the control for the given name
   */
  setControl<K extends StringKeys<T>>(name: K, control: ControlType<T[K]>) {
    return super.setControl(name, control);
  }

  /**
   * Check whether there is an enabled control with the given name in the group.
   *
   * Reports false for disabled controls. If you'd like to check for existence in the group
   * only, use [get](https://angular.io/api/forms/AbstractControl#get) instead.
   *
   * @param name The control name to check for existence in the collection
   *
   * @returns false for disabled controls, true otherwise.
   */
  contains<K extends StringKeys<T>>(name: K) {
    return super.contains(name);
  }

  /**
   * Sets the value of the `FormGroup`. It accepts an object that matches
   * the structure of the group, with control names as keys.
   *
   * ### Set the complete value for the form group
   *
```ts
const form = new FormGroup({
  first: new FormControl(),
  last: new FormControl()
});

console.log(form.value);   // {first: null, last: null}

form.setValue({first: 'Nancy', last: 'Drew'});
console.log(form.value);   // {first: 'Nancy', last: 'Drew'}
```
   *
   * @throws When strict checks fail, such as setting the value of a control
   * that doesn't exist or if you excluding the value of a control.
   *
   * @param value The new value for the control that matches the structure of the group.
   * @param options Configuration options that determine how the control propagates changes
   * and emits events after the value changes.
   * The configuration options are passed to the
   * [updateValueAndValidity](https://angular.io/api/forms/AbstractControl#updateValueAndValidity) method.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   */
  setValue(value: Required<T>, options: { onlySelf?: boolean; emitEvent?: boolean } = {}) {
    return super.setValue(value, options);
  }

  /**
   * Patches the value of the `FormGroup`. It accepts an object with control
   * names as keys, and does its best to match the values to the correct controls
   * in the group.
   *
   * It accepts both super-sets and sub-sets of the group without throwing an error.
   *
   * ### Patch the value for a form group
   *
```ts
const form = new FormGroup({
   first: new FormControl(),
   last: new FormControl()
});
console.log(form.value);   // {first: null, last: null}

form.patchValue({first: 'Nancy'});
console.log(form.value);   // {first: 'Nancy', last: null}
```
   *
   * @param value The object that matches the structure of the group.
   * @param options Configuration options that determine how the control propagates changes and
   * emits events after the value is patched.
   * * `onlySelf`: When true, each change only affects this control and not its parent. Default is
   * true.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * The configuration options are passed to the
   * [updateValueAndValidity](https://angular.io/api/forms/AbstractControl#updateValueAndValidity) method.
   */
  patchValue(value: Partial<T>, options: { onlySelf?: boolean; emitEvent?: boolean } = {}) {
    return super.patchValue(value, options);
  }

  /**
   * Resets the `FormGroup`, marks all descendants are marked `pristine` and `untouched`, and
   * the value of all descendants to null.
   *
   * You reset to a specific form state by passing in a map of states
   * that matches the structure of your form, with control names as keys. The state
   * is a standalone value or a form state object with both a value and a disabled
   * status.
   *
   * @param formState Resets the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param options Configuration options that determine how the control propagates changes
   * and emits events when the group is reset.
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   * The configuration options are passed to the
   * [updateValueAndValidity](https://angular.io/api/forms/AbstractControl#updateValueAndValidity) method.
   *
   *
   * ### Reset the form group values
   *
```ts
const form = new FormGroup({
  first: new FormControl('first name'),
  last: new FormControl('last name')
});

console.log(form.value);  // {first: 'first name', last: 'last name'}

form.reset({ first: 'name', last: 'last name' });

console.log(form.value);  // {first: 'name', last: 'last name'}
```
   *
   * ### Reset the form group values and disabled status
   *
```ts
const form = new FormGroup({
  first: new FormControl('first name'),
  last: new FormControl('last name')
});

form.reset({
  first: {value: 'name', disabled: true},
  last: 'last'
});

console.log(this.form.value);  // {first: 'name', last: 'last name'}
console.log(this.form.get('first').status);  // 'DISABLED'
```
   */
  reset(value: Required<T> = {} as any, options: { onlySelf?: boolean; emitEvent?: boolean } = {}) {
    return super.reset(value, options);
  }

  /**
   * The aggregate value of the `FormGroup`, including any disabled controls.
   *
   * Retrieves all values regardless of disabled status.
   * The `value` property is the best way to get the value of the group, because
   * it excludes disabled controls in the `FormGroup`.
   */
  getRawValue() {
    return super.getRawValue() as T;
  }

  /**
   * Retrieves a child control given the control's name.
   *
   * ### Retrieve a nested control
   *
   * For example, to get a `name` control nested within a `person` sub-group:
```ts
this.form.get('person').get('name');
```
   */
  get<K extends StringKeys<T>>(controlName: K) {
    return super.get(controlName) as ControlType<T[K]> | null;
  }

  /**
   * Sets the synchronous validators that are active on this control. Calling
   * this overwrites any existing sync validators.
   */
  setValidators(newValidator: ValidatorFn<E> | ValidatorFn<E>[] | null) {
    return super.setValidators(newValidator);
  }

  /**
   * Sets the async validators that are active on this control. Calling this
   * overwrites any existing async validators.
   */
  setAsyncValidators(newValidator: AsyncValidatorFn<E> | AsyncValidatorFn<E>[] | null) {
    return super.setAsyncValidators(newValidator);
  }

  /**
   * Sets errors on a form control when running validations manually, rather than automatically.
   *
   * Calling `setErrors` also updates the validity of the parent control.
   *
   * ### Manually set the errors for a control
   *
   * ```ts
   * const login = new FormControl('someLogin');
   * login.setErrors({
   *   notUnique: true
   * });
   *
   * expect(login.valid).toEqual(false);
   * expect(login.errors).toEqual({ notUnique: true });
   *
   * login.setValue('someOtherLogin');
   *
   * expect(login.valid).toEqual(true);
   * ```
   */
  setErrors(errors: ValidationErrors<E> | null, opts: { emitEvent?: boolean } = {}) {
    return super.setErrors(errors, opts);
  }

  /**
   * Reports error data for the control with the given controlName.
   *
   * @param errorCode The code of the error to check
   * @param controlName A control name that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * For example, for the following `FormGroup`:
   *
```ts
form = new FormGroup({
  address: new FormGroup({ street: new FormControl() })
});
```
   *
   * The controlName to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in combination with `get()` method:
   * 
```ts
form.get('address').getError('someErrorCode', 'street');
```
   *
   * @returns error data for that particular error. If the control or error is not present,
   * null is returned.
   */
  getError<P extends StringKeys<E>, K extends StringKeys<T>>(errorCode: P, controlName?: K) {
    return super.getError(errorCode, controlName) as E[P] | null;
  }

  /**
   * Reports whether the control with the given controlName has the error specified.
   *
   * @param errorCode The code of the error to check
   * @param controlName A control name that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * For example, for the following `FormGroup`:
   *
```ts
form = new FormGroup({
  address: new FormGroup({ street: new FormControl() })
});
```
   *
   * The controlName to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in combination with `get()` method:
```ts
form.get('address').hasError('someErrorCode', 'street');
```
   *
   * If no controlName is given, this method checks for the error on the current control.
   *
   * @returns whether the given error is present in the control at the given controlName.
   *
   * If the control is not present, false is returned.
   */
  hasError<P extends StringKeys<E>, K extends StringKeys<T>>(errorCode: P, controlName?: K) {
    return super.hasError(errorCode, controlName);
  }
}
