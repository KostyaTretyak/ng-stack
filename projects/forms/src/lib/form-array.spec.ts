import { FormArray } from './form-array';

// tslint:disable: no-unused-expression

describe('FormArray', () => {
  class Profile {
    firstName: string;
    lastName: string;
    addresses: Address[];
  }

  class Address {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  xdescribe('checking types only', () => {
    // Waiting for resolving https://github.com/Microsoft/TypeScript/issues/30207
  });

  describe(`checking runtime work`, () => {});
});
