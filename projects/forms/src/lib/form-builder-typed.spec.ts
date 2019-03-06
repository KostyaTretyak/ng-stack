import { Validators } from '@angular/forms';

import { FormBuilderTyped as FormBuilder } from './form-builder-typed';
import { FormControlTyped as FormControl } from './form-control-typed';

describe('FormBuilder', () => {
  xdescribe('checking types only', () => {
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
      // userName: 123,
      // userEmail: new FormGroup({}),
      userEmail: new FormControl('some-one@gmail.com'),
      addresses: fb.group({ city: 'Kyiv' }),
      someArray: fb.array([
        fb.group({ item1: 'value1' }),
        fb.group({ item1: 'value2' }),
        fb.group({ item1: 'value3' }),
        fb.group({ item1: 'value4' }),
      ]),
      // otherArray: fb.array([new FormControl(5), new FormGroup({}), 'three']),
      // otherArray: fb.array([new FormControl('one'), 2, 'three']), // Error --> Why?
      otherArray: fb.array([new FormControl('one'), ['two', Validators.required], 'three']),
    });

    formGroup1.get('otherArray').setValue(['string value', 2, 'three']);
  });

  describe(`checking runtime work`, () => {
    describe(`constructor()`, () => {});
    describe(`other methods`, () => {});
  });
});
