# @ng-stack/forms

> provides wrapped Angular's Reactive Forms to write its more strongly typed.

## Table of contents
- [Install](#install)
- [Usage](#usage)
  - [Using form model](#using-form-model)
  - [Automatically detect appropriate types for form controls](#automatically-detect-appropriate-types-for-form-controls)
  - [Typed Validations](#typed-validations)
  - [Support input[type="file"]](#support-input-with-type-file)
- [How does it works](#how-does-it-works)
- [Changes API](#changes-api)

## Install

```bash
npm i @ng-stack/forms
```

OR

```bash
yarn add @ng-stack/forms
```

## Usage

Import into your module `NgStackFormsModule`, and no need import `ReactiveFormsModule` because it's already
reexported by `NgStackFormsModule`.

```ts
import { NgStackFormsModule } from '@ng-stack/forms';

// ...

@NgModule({
  // ...
  imports: [
    NgStackFormsModule
  ]

// ...

});
```
Then you should be able just import and using classes from `@ng-stack/forms`.

### Using form model

```ts
import { FormGroup, FormControl, FormArray } from '@ng-stack/forms';

const formClontrol = new FormControl('some string');
const value = formClontrol.value; // some string

formClontrol.setValue(123); // Error: Argument of type '123' is not assignable...

// Form model
class Address {
  city: string;
  street: string;
  zip: string;
  other: string;
}

const formGroup = new FormGroup<Address>({
  city: new FormControl('Kyiv'),
  street: new FormControl('Khreshchatyk'),
  zip: new FormControl('01001'),
  // other: new FormControl(123), // Error: Type 'number' is not assignable to type 'string'
});

// Note: form model hints for generic without []
const formArray = new FormArray<Address>([
  formGroup,
  formGroup,
  formGroup,

  new FormGroup({ someProp: new FormControl('') }),
  // Error: Type '{ someProp: string; }' is missing
  // the following properties from type 'Address': city, street, other
]);
```

### Automatically detect appropriate types for form controls

`FormGroup()`, `formBuilder.group()`, `FormArray()` and `formBuilder.array()` attempt to automatically detect
appropriate types for form controls by their form models.

Simple example:

```ts
import { FormControl, FormGroup } from '@ng-stack/forms';

// Form model
class Address {
  city: string;
  street: string;
  zip: string;
  other: string;
}

const formGroup = new FormGroup<Address>({
  city: new FormControl('Mykolaiv'), // OK

  street: new FormGroup({}),
  // Error: Type 'FormGroup<any, ValidatorsModel>' is missing
  // the following properties from type 'FormControl<string, ValidatorsModel>'
});
```

As we can see, constructor of `FormGroup` accept form model `Address` for its generic and knows that
property `street` have primitive type and should to have a value only with instance of `FormControl`.

If some property of a form model have type that extends `object`, then an appropriate property in a form
should to have a value with instance of `FormGroup`. So for an array - instance of `FormArray`.

But maybe you want for `FormControl` to accept an object in its constructor, instead of a primitive value.
What to do in this case? For this purpose a special type `Control<T>` was intended.

For example:

```ts
import { FormControl, Control, FormGroup } from '@ng-stack/forms';

// Form model
class Address {
  city: string;
  street: string;
  zip: string;
  other: Control<Other>; // Here should be FormControl, instead of a FormGroup
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

So, if your `FormGroup` knows about types of properties a form model, it inferring appropriate types of form controls
for their values.

And no need to do this in your components:

```ts
get userName() {
  return this.formGroup.get('userName') as FormControl;
}

get addresses() {
  return this.formGroup.get('addresses') as FormGroup;
}
```

Now do this:

```ts
// Note here form model UserForm
formGroup: FormGroup<UserForm>;

get userName() {
  return this.formGroup.get('userName');
}

get addresses() {
  return this.formGroup.get('addresses');
}
```

### Typed Validations

Classes `FormControl`, `FormGroup`, `FormArray` and all methods of `FormBuilder`
accept a "validation model" as second parameter for their generics:

```ts
interface ValidationModel {
  someErrorCode: { returnedValue: 123 };
}
const control = new FormControl<string, ValidationModel>('some value');
control.getError('someErrorCode'); // OK
control.errors.someErrorCode; // OK
control.getError('notExistingErrorCode'); // Error: Argument of type '"notExistingErrorCode"' is not...
control.errors.notExistingErrorCode; // Error: Property 'notExistingErrorCode' does not exist...
```

By default is used class `ValidatorsModel`.

```ts
const control = new FormControl('some value');
control.getError('required'); // OK
control.getError('email'); // OK
control.errors.required // OK
control.errors.email // OK
control.getError('notExistingErrorCode'); // Error: Argument of type '"notExistingErrorCode"' is not...
control.errors.notExistingErrorCode // Error: Property 'notExistingErrorCode' does not exist...
```

`ValidatorsModel` contains a list of properties extracted from `typeof Validators`,
additional validators for support `input[type="file"]`, and expected returns types:

```ts
class ValidatorsModel {
  min: { min: { min: number; actual: number } };
  max: { max: { max: number; actual: number } };
  required: { required: true };
  requiredTrue: { required: true };
  email: { email: true };
  minLength: { minlength: { requiredLength: number; actualLength: number } };
  maxLength: { requiredLength: number; actualLength: number };
  pattern: { requiredPattern: string; actualValue: string };

  // Additional validators for support `input[type="file"]`
  fileRequired: { requiredSize: number; actualSize: number; file: File };
  filesMinLength: { requiredLength: number; actualLength: number };
  filesMaxLength: { requiredLength: number; actualLength: number };
  fileMaxSize: { requiredSize: number; actualSize: number; file: File };
}
```

### Support input with type "file"

Since version 1.1.0, `@ng-stack/forms` supports `input[type="file"]`.

#### Form value as FormData

By default, if we have `input[type="file"]`, the module setting instance of `FormData` to `formControl.value`.

Example:

```ts
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { FormControl, Validators } from '@ng-stack/forms';

// You should to have your own AppConfig here
import { AppConfig } from 'src/app-config';

@Component({
  template: `
    <input type="file" accept=".jpg,.jpeg,.png" [formControl]="formControl" (change)="onFileChose()" />
  `
})
export class MyComponent implements OnInit {
  formControl: FormControl<FormData>;

  constructor(private httpClient: HttpClient, private appConfig: AppConfig) {}

  ngOnInit() {
    const validator = Validators.fileMaxSize(this.appConfig.maxAvaSize);
    this.formControl = new FormControl(null, validator);
  }

  onFileChose() {
    const action = 'upload an avatar';
    const duration = 6000;
    const validErr = this.formControl.getError('fileMaxSize');

    if (validErr) {
      const requiredSize = Math.round(validErr.requiredSize / 1024);
      const actualSize = Math.round(validErr.actualSize / 1024);
      const msg = `The file should not exceed ${requiredSize} kB (you upload ${actualSize} kB)`;
      this.showMsg(msg, action, duration);
      return;
    }

    // Value of formControl here is instance of FormData and it's OK to directly upload this value.
    const formData = this.formControl.value;

    this.httpClient.patch('api/users/250/avatars/1', formData).subscribe(() => {
      const msg = 'Avatar uploaded successfully';
      this.showMsg(msg, action, duration);
    });
  }

  private showMsg(msg: string, action: string, duration?: number) {
    // Some logic here.
  }
}
```

See this [example on stackblitz](https://stackblitz.com/edit/angular-input-file).

#### Known issues

For now, the functionality - when a match between a validation model and actually entered validator's functions is checked - is not supported.

For example:

```ts
interface ValidationModel {
  someErrorCode: { returnedValue: 123 };
}
const control = new FormControl<string, ValidationModel>('some value');
const validatorFn: ValidatorFn = (c: AbstractControl) => ({ otherErrorCode: { returnedValue: 456 } });

control.setValidators(validatorFn);
// Without error, but it's not checking
// match between `someErrorCode` and `otherErrorCode`
```

See: [bug(forms): issue with interpreting of a validation model](https://github.com/KostyaTretyak/ng-stack/issues/15).

## How does it works

In almost all cases, this module absolutely does not change the runtime behavior of native Angular methods.

Classes are rewritten as follows:

```ts
import { FormGroup as NativeFormGroup } from '@angular/forms';

export class FormGroup extends NativeFormGroup {
  get(path) {
    return super.get(path);
  }
}
```

The following section describes the changes that have occurred. All of the following restrictions apply only because of the need to more clearly control the data entered by developers.

## Changes API

### get()

- `formGroup.get()` supporting only signature:

  ```ts
  formGroup.get('address').get('street');
  ```

  and not supporting:

  ```ts
  formGroup.get('address.street');
  // OR
  formGroup.get(['address', 'street']);
  ```

- Angular's native `formControl.get()` method always returns `null`. Because of this, supporting signature only `get()` (without arguments).
See also issue on github [feat(forms): hide get() method of FormControl from public API](https://github.com/angular/angular/issues/29091).

### getError() and hasError()

- `formGroup.getError()` and `formGroup.hasError()` supporting only this signature:

  ```ts
  formGroup.get('address').getError('someErrorCode', 'street');
  ```

  And not supporting this signature:

  ```ts
  formGroup.getError('someErrorCode', 'address.street');
  // OR
  formGroup.getError('someErrorCode', ['address', 'street']);
  ```

- `formControl.getError()` and `formControl.hasError()` supporting only this signature (without second argument):

  ```ts
  formControl.getError('someErrorCode');
  ```

### ValidatorFn and AsyncValidatorFn

Native `ValidatorFn` and `AsyncValidatorFn` are interfaces, in `@ng-stack/forms` they are types.