# @ng-stack/forms

> provides wrapped Angular's Reactive Forms to write its more strongly typed.

## Table of contents
- [Install](#install)
- [Usage](#usage)
  - [Using form model](#using-form-model)
  - [Automatically detect appropriate types for form controls](#automatically-detect-appropriate-types-for-form-controls)
  - [Typed Validations](#typed-validations)
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
  zip?: string;
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
  zip?: string;
  other: string;
}

const formGroup = new FormGroup<Address>({
  city: new FormControl('Mykolaiv'), // OK

  street: new FormGroup({}),
  // Error: Type 'FormGroup<any, ValidatorsModel>' is missing
  // the following properties from type 'FormControl<string, ValidatorsModel>'
});
```

As we can see, constructor of `FormGroup` takes form model `Address` for its generic and knows that
property `street` have primitive type and should to have a value only with instance of `FormControl`.

If some property of a form model have type that extends `object`, then it should to have a value with
instance of `FormGroup`. So for an array - instance of `FormArray`.

But maybe you want for `FormControl` to accept an object in its constructor, instead of a primitive value.
What to do in this case? For this purpose a special type `Control<T>` was intended.

For example:

```ts
import { FormControl, Control, FormGroup } from '@ng-stack/forms';

// Form model
class Address {
  city: string;
  street: string;
  zip?: string;
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
accept "error validation model" as second parameter for a generic:

```ts
const control = new FormControl<string, { someErrorCode: { returnedValue: 123 } }>('some value');
control.getError('someErrorCode'); // OK
control.errors.someErrorCode // OK
control.getError('notExistingErrorCode'); // Error: Argument of type '"notExistingErrorCode"' is not...
control.errors.notExistingErrorCode // Error: Property 'notExistingErrorCode' does not exist...
```

By default used special type called `ValidatorsModel`.

```ts
const control = new FormControl('some value');
control.getError('required'); // OK
control.getError('email'); // OK
control.errors.required // OK
control.errors.email // OK
control.getError('notExistingErrorCode'); // Error: Argument of type '"notExistingErrorCode"' is not...
control.errors.notExistingErrorCode // Error: Property 'notExistingErrorCode' does not exist...
```

`ValidatorsModel` contains a list of properties extracted from `typeof Validators`, and expected returns types:

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
}
```

#### Known issues

For now, the functionality - when a match between a validation model and actually entered validator's functions is checked - is not supported.

For example:

```ts
const control = new FormControl<string, { someErrorCode: { returnedValue: 123 } }>('some value');
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

The following section describes the changes that have occurred. All of the following restrictions apply only because of the need to more clearly control the data entered by the user.

## Changes API

### get()

- `formGroup.get()` supporting only signature:

  ```ts
  form.get('address').get('street');
  ```

  and not supporting:

  ```ts
  form.get('address.street');
  // OR
  form.get(['address', 'street']);
  ```

- Angular native `formControl.get()` method always returns `null`. Because of this, supporting signature only `get()` (without arguments).
See also issue on github [feat(forms): hide get() method of FormControl from public API](https://github.com/angular/angular/issues/29091).

### getError() and hasError()

- `formGroup.getError()` and `formGroup.hasError()` supporting only this signature:

  ```ts
  form.get('address').getError('someErrorCode', 'street');
  ```

  And not supporting this signature:

  ```ts
  form.getError('someErrorCode', 'address.street');
  // OR
  form.getError('someErrorCode', ['address', 'street']);
  ```

- `formControl.getError()` and `formControl.hasError()` supporting only this signature (without second argument):

  ```ts
  control.getError('someErrorCode');
  ```

### ValidationErrors

Native `ValidatorFn` and `AsyncValidatorFn` are interfaces, in `@ng-stack/forms` this are types.