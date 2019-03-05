## Install

```bash
npm i @ng-stack/forms
```

OR

```bash
yarn add @ng-stack/forms
```

## Usage

### FormControl, FormGroup, FormArray

```ts
class Address {
  city: string;
  street: string;
  numFlat?: number;
}

class SomeGroup {
  children: number;
}

class Profile {
  firstName: string;
  address: Control<Address>;
  someGroup: SomeGroup;
  someArray: number[];
}

formGroup = new FormGroup<Profile>({
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
class Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

class SomeArray {
  item1?: string;
  item2?: number;
}

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

## Changes API

### get()

- For `FormGroup` supporting only signature `get(controlName: string)`, not supporting `get(path: Array<number | string>)`.
- For `FormControl` `get()` method always returns null. Because this is, supporting signature only `get()` (without arguments).
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
