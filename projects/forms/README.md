## Install

```bash
npm i @ng-stack/forms
```

OR

```bash
yarn add @ng-stack/forms
```

## Usage

Import into your module Angular `ReactiveFormsModule` and `NgStackFormsModule`.

```ts
import { ReactiveFormsModule } from '@angular/forms';

import { NgStackFormsModule } from '@ng-stack/forms';

// ...

@NgModule({
  // ...
  imports: [
    ReactiveFormsModule,
    NgStackFormsModule
  ]

// ...

});
```
Then you should be able just import and using classes from `@ng-stack/forms`.

### FormControl, FormGroup, FormArray

```ts
import { Control, FormGroup, FormControl, FormArray } from '@ng-stack/forms';

// Form model
class Address {
  city: string;
  street: string;
  numFlat?: number;
}

// Form model
class SomeGroup {
  children: number;
}

// Form model
class Profile {
  firstName: string;
  address: Control<Address>; // Note here Control<T>, this is described below.
  someGroup: SomeGroup;
  someArray: number[];
}

const formGroup = new FormGroup<Profile>({
  firstName: new FormControl('SomeOne'),
  address: new FormControl({
    value: { other: 'some value', city: 'Kyiv', street: 'Khreshchatyk' },
    disabled: false,
  }),
  someGroup: new FormGroup({ children: new FormControl(2) }),
  someArray: new FormArray<number>([
    new FormControl(1),
    new FormControl(2),
    new FormControl(3),
    new FormControl(4),
    new FormControl(5),
  ]),
});
```

### FormBuilder

```ts
import { Validators } from '@angular/forms';

import { FormBuilder, FormControl } from '@ng-stack/forms';

// Form model
class Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// Form model
class SomeArray {
  item1?: string;
  item2?: number;
}

// Form model
class UserForm {
  userName: string;
  userEmail: string;
  password: string;
  addresses: Address;
  someArray: SomeArray[];
  otherArray: (string | number)[];
}

const fb = new FormBuilder();

const formGroup1 = fb.group<UserForm>({
  userName: 'SomeOne',
  userEmail: new FormControl('some-one@gmail.com'),
  addresses: fb.group({ city: 'Kyiv' }),
  someArray: fb.array([
    fb.group({ item1: 'value1' }),
    fb.group({ item1: 'value2' }),
    fb.group({ item1: 'value3' }),
    fb.group({ item1: 'value4' }),
  ]),
  otherArray: fb.array([new FormControl('one'), ['two', Validators.required], 'three']),
});

formGroup1.get('otherArray').setValue(['string value', 2, 'three']);
```

### Automatically detect appropriate types for form controls

`FormGroup()`, `FormArray()`, `formBuilder.group()` and `formBuilder.array()` attempt to automatically detect
appropriate types for form controls by their form models.

For example:

```ts
import { Control, FormGroup, FormControl } from '@ng-stack/forms';

// Form model
class Address {
  city: string;
  street: string;
}

// Form model
class Other {
  children: number;
}

// Form model
class Profile {
  firstName: string;
  address: Control<Address>;
  other: Other;
}

const formGroup = new FormGroup<Profile>({
  firstName: new FormControl('SomeOne'),
  address: new FormControl({
    city: 'Kyiv',
    street: 'Khreshchatyk',
  }),
  other: new FormGroup({
    children: new FormControl(5),
  }),
});
```

the above classes will assume that:
- `firstName` have value with FormControl, because it have a primitive type in form model `Profile`
- `address` have value with FormControl, because its form model marked as `Control<Address>`
- `other` have value with FormGroup, because it have type that extends `object` in form model `Profile`

Here `Control<T>` generic intended if you want pass to `FormControl()` constructor object (not a primitive type).

So, no need to do this in your components:

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

## Changes API

### get()

- For `FormGroup` supporting only signature `get(controlName: string)`, not supporting `get(path: Array<number | string>)`.
- Angular native `FormControl` `get()` method always returns null. Because this is, supporting signature only `get()` (without arguments).
See also issue on github [feat(forms): hide get() method of FormControl from public API](https://github.com/angular/angular/issues/29091).

### getError() and hasError()

- For `FormGroup` call `getError()` and `hasError()` this way:

```ts
form.get('address').getError('someErrorCode', 'street');
```

Not supporting this signature:

```ts
form.getError('someErrorCode', 'address.street');
// OR
form.getError('someErrorCode', ['address', 'street']);
```

- For `FormControl` call `getError()` and `hasError()` this way (without second argument):

```ts
control.getError('someErrorCode');
```
