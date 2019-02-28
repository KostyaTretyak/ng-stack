import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { StringKeys, ControlOfFormGroup } from './types';

export class FormGroupTyped<T extends object = any> extends FormGroup {
  readonly value: T;
  readonly valueChanges: Observable<T>;

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
    public controls: { [K in StringKeys<T>]?: ControlOfFormGroup<T, K> },
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
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
  registerControl<K extends StringKeys<T>>(name: K, control: ControlOfFormGroup<T, K>) {
    return super.registerControl(name, control) as ControlOfFormGroup<T, K>;
  }

  /**
   * Add a control to this group.
   *
   * This method also updates the value and validity of the control.
   *
   * @param name The control name to add to the collection
   * @param control Provides the control for the given name
   */
  addControl<K extends StringKeys<T>>(name: K, control: ControlOfFormGroup<T, K>) {
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
  setControl<K extends StringKeys<T>>(name: K, control: ControlOfFormGroup<T, K>) {
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
  setValue(value: T, options: { onlySelf?: boolean; emitEvent?: boolean } = {}) {
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
  reset(value?: T, options: { onlySelf?: boolean; emitEvent?: boolean } = {}) {
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

  get<K extends StringKeys<T>>(path: K | Array<K | number>) {
    return super.get(path) as ControlOfFormGroup<T, K> | null;
  }
}
