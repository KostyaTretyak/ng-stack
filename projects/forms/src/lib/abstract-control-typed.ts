import { AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { Status, StringKeys, ControlType } from './types';

export abstract class AbstractControlTyped<T = any> extends AbstractControl {
  readonly value: T;
  readonly valueChanges: Observable<T>;
  readonly statusChanges: Observable<Status>;

  /**
   * Sets the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract setValue(value: T, options?: object): void;

  /**
   * Patches the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract patchValue(value: T, options?: object): void;

  /**
   * Resets the control. Abstract method (implemented in sub-classes).
   */
  abstract reset(value?: T, options?: object): void;

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
  get<K extends StringKeys<T>>(controlName: T extends object ? K : never) {
    return super.get(controlName) as (T extends object ? ControlType<T[K]> : null);
  }

  /**
   * Reports error data for the control with the given path.
   *
   * @param errorCode The code of the error to check
   * @param controlName A list of control names that designates how to move from the current control
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
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
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
  getError<K extends StringKeys<T>>(errorCode: string, controlName?: T extends object ? K : never) {
    return super.getError(errorCode, controlName);
  }

  /**
   * Reports whether the control with the given path has the error specified.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
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
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in combination with `get()` method:
```ts
form.get('address').getError('someErrorCode', 'street');
```
   *
   * If no controlName is given, this method checks for the error on the current control.
   *
   * @returns whether the given error is present in the control at the given controlName.
   *
   * If the control is not present, false is returned.
   */
  hasError<K extends StringKeys<T>>(errorCode: string, controlName?: T extends object ? K : never) {
    return super.hasError(errorCode, controlName);
  }
}
