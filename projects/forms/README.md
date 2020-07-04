# @ng-stack/forms

> provides wrapped Angular's Reactive Forms to write its more strongly typed.

## Table of contents
- [Install](#install)
- [Usage](#usage)
  - [Using form model](#using-form-model)
  - [Automatically detect appropriate types for form controls](#automatically-detect-appropriate-types-for-form-controls)
  - [Typed Validations](#typed-validations)
  - [Support input[type="file"]](#support-input-with-type-file)
    - [`preserveValue` option](#preserveValue-option)
- [Known issues](#known-issues)
  - [Known issues with ValidatorFn](#known-issues-with-validatorfn)
  - [Known issues with data type infer](#known-issues-with-data-type-infer)
- [How does it works](#how-does-it-works)
- [Changes API](#api-changes)

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

})
```
Then you should be able just import and using classes from `@ng-stack/forms`.

### Using form model

```ts
import { FormGroup, FormControl, FormArray } from '@ng-stack/forms';

const formControl = new FormControl('some string');
const value = formControl.value; // some string

formControl.setValue(123); // Error: Argument of type '123' is not assignable...

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

As you can see, constructor of `FormGroup` accept form model `Address` for its generic and knows that
property `street` have primitive type and should to have a value only with instance of `FormControl`.

If some property of a form model have type that extends `object`, then an appropriate property in a form
should to have a value with instance of `FormGroup`. So for an array - instance of `FormArray`.

But maybe you want for `FormControl` to accept an object in its constructor, instead of a primitive value.
What to do in this case? For this purpose a special type `Control<T>` was intended.

For example:

```ts
import { FormBuilder, Control } from '@ng-stack/forms';

const fb = new FormBuilder();

// Form Model
interface Person {
  id: number;
  name: string;
  birthDate: Control<Date>; // Here should be FormControl, instead of a FormGroup
}

const form = fb.group<Person>({
  id: 123,
  name: 'John Smith',
  birthDate: new Date(1977, 6, 30),
});

const birthDate: Date = form.value.birthDate; // As you can see, `Control<Date>` type is compatible with `Date` type.
```

If the form model interface comes from an external library, you can do the following:

```ts
import { FormBuilder, Control } from '@ng-stack/forms';

// External Form Model
interface ExternalPerson {
  id: number;
  name: string;
  birthDate: Date;
}

const formConfig: ExternalPerson = {
  id: 123,
  name: 'John Smith',
  birthDate: new Date(1977, 6, 30),
};

interface Person extends ExternalPerson {
  birthDate: Control<Date>;
}


const fb = new FormBuilder();
const form = fb.group<Person>(formConfig); // `Control<Date>` type is compatible with `Date` type.

const birthDate: Date = form.value.birthDate; // `Control<Date>` type is compatible with `Date` type.
```

So, if your `FormGroup` knows about types of properties a form model, it inferring appropriate types of form controls
for their values.

And no need to do `as FormControl` or `as FormGroup` in your components:

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
additional validators to support `input[type=file]`, and expected returns types:

```ts
class ValidatorsModel {
  min: { min: number; actual: number };
  max: { max: number; actual: number };
  required: true;
  email: true;
  minlength: { requiredLength: number; actualLength: number };
  maxlength: { requiredLength: number; actualLength: number };

  // Additional validators to support `input[type=file]`
  fileRequired: { requiredSize: number; actualSize: number; file: File };
  filesMinLength: { requiredLength: number; actualLength: number };
  filesMaxLength: { requiredLength: number; actualLength: number };
  fileMaxSize: { requiredSize: number; actualSize: number; file: File };
}
```
See also [Known issues with ValidatorFn](#known-issues-with-validatorFn).

### Support input with type "file"

Since version 1.1.0, `@ng-stack/forms` supports `input[type=file]`.

The module will be set instance of `FormData` to `formControl.value`,
and output event `select` with type `File[]`:

For example, if you have this component template:

```html
<input type="file" (select)="onSelect($event)" [formControl]="formControl">
```

In your component class, you can get selected files from `select` output event:

```ts
// ...

onSelect(files: File[]) {
  console.log('selected files:', files);
}

// ...
```

You can validate the `formControl` with four methods:

```ts
import { Validators, FormControl } from '@ng-stack/forms';

// ...

const validators = [
  Validators.fileRequired;
  Validators.filesMinLength(2);
  Validators.filesMaxLength(10);
  Validators.fileMaxSize(1024 * 1024);
];

this.formControl = new FormControl<FormData>(null, validators);

// ...

const validErr = this.formControl.getError('fileMaxSize');

if (validErr) {
  const msg = `Every file should not exceed ${validErr.requiredSize} kB (you upload ${validErr.actualSize} kB)`;
  this.showMsg(msg);
  return;
}

// ...
```

A more complete example can be seen on github [example-input-file](https://github.com/KostyaTretyak/example-input-file)
and on [stackblitz](https://stackblitz.com/github/KostyaTretyak/example-input-file).

#### `preserveValue` option

Since version 2.1.0, with `input[type=file]` you can also pass `preserveValue` attribute to preserve the field's native value of HTML form control:

```html
<input type="file" [formControl]="formControl" preserveValue/>
```

Without `preserveValue`, you may see unwanted text near the input control - "No file chosen". As a workaround, you can do the following:

```html
<label for="files" class="here-class-for-your-button">Select Image</label>
<input ... id="files" style="display:none"/>
```

So you can change the output text to the desired one.

By default `preserveValue="false"` but if you want set `preserveValue="true"`, keep in mind that when you need to re-select the same file after changing it in the file system (for example, reduce the size of the avatar image), you will not be able to see the changes. This is how the browser cache works.

## Known issues

#### Known issues with data type infer

Without a data type hint, there is a limitation of the TypeScript that does not allow you to correctly infer the data type for nested form controls based on the usage:

```ts
import { FormControl, FormGroup, FormArray } from '@ng-stack/forms';

const formGroup1 = new FormGroup({ prop: new FormControl('') }); // OK
const formGroup2 = new FormGroup({ prop: new FormGroup({}) }); // OK

const formGroup3 = new FormGroup({ prop: new FormArray([]) }); // Error, but it's wrong
const formGroup4 = new FormGroup<{ prop: any[] }>({ prop: new FormArray([]) }); // OK

interface NestedModel {
  one: number;
}

interface Model {
  prop: NestedModel;
}

const formGroup5 = new FormGroup<Model>({ prop: new FormGroup({ one: new FormControl(123) }) }); // OK

// Here is an error, but it's OK, because the nested `FormGroup` does not have the `one` property as required by the `Model`.
const formGroup6 = new FormGroup<Model>({ prop: new FormGroup({ other: new FormControl(123) }) });

// Here without errors, but it's wrong, because the nested `FormGroup` does not have the `two` property in the `Model`.
const formGroup7 = new FormGroup<Model>({
  prop: new FormGroup({ one: new FormControl(123), two: new FormControl('') }),
});

// To fix the previous example, add a type hint for the nested FormGroup:
const formGroup8 = new FormGroup<Model>({
  prop: new FormGroup<NestedModel>({ one: new FormControl(123), two: new FormControl('') }),
});

const formState = { value: 2, disabled: false };
const control = new FormControl(formState);
control.patchValue(2); // Argument of type '2' is not assignable to parameter of type '{ value: number; disabled: boolean; }'

// To fix previous example, add a type hint for the FormControl generic:
const formState = { value: 2, disabled: false };
const control = new FormControl<number>(formState);
control.patchValue(2); // OK
```

See [bug(generics): errors of inferring types for an array](https://github.com/microsoft/TypeScript/issues/30207).

#### Known issues with ValidatorFn

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

Classes are overrided as follows:

```ts
import { FormGroup as NativeFormGroup } from '@angular/forms';

export class FormGroup extends NativeFormGroup {
  get(path) {
    return super.get(path);
  }
}
```

The following section describes the changes that have occurred. All of the following restrictions apply only because of the need to more clearly control the data entered by developers.

## API Changes

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