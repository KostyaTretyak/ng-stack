import { Validators } from '@angular/forms';

import { FormBuilderTyped } from './form-builder-typed';
import { FormControlTyped } from './form-control-typed';
import { FormGroupTyped } from './form-group-typed';
import { FormArrayTyped } from './form-array-typed';

class Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

class ItemsOfArray {
  item1?: string;
  item2?: number;
}

class UserForm {
  userName: string;
  userEmail: string;
  password: string;
  addresses: Address;
  someArray: ItemsOfArray[];
  otherArray: (string | number)[];
}

const fb = new FormBuilderTyped();

const formGroup1 = fb.group<UserForm>({
  userName: 'SomeOne',
  // userEmail: new FormGroupTyped({}),
  userEmail: new FormControlTyped('some-one@gmail.com'),
  addresses: fb.group({ city: 'Kyiv' }),
  someArray: fb.array([
    fb.group({ item1: 'value1' }),
    fb.group({ item1: 'value2' }),
    fb.group({ item1: 'value3' }),
    fb.group({ item1: 'value4' }),
  ]),
  // otherArray: fb.array([new FormControlTyped(5), new FormGroupTyped({}), 'three']),
  // otherArray: fb.array([new FormControlTyped('one'), 2, 'three']), // Error --> Why?
  otherArray: fb.array([new FormControlTyped('one'), ['two', Validators.required], 'three']), // Error --> Why?
});

formGroup1.get('otherArray').setValue(['string value', 2, 'three']);
