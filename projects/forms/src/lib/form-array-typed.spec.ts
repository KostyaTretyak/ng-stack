import { FormArrayTyped } from './form-array-typed';
import { FormControlTyped } from './form-control-typed';
import { FormGroupTyped } from './form-group-typed';

describe('FormArrayTyped', () => {
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

  describe(`checking that we knows how native FormArray works`, () => {
    it('passing to constructor primitive types as params', () => {
      // Mapping between param and expected
      const map = new Map<any[], any[]>();
      let param: any;
      let expected: any;

      param = [new FormControlTyped('one'), new FormControlTyped('two')];
      expected = ['one', 'two'];
      map.set(param, expected);

      param = [
        new FormGroupTyped({ city: new FormControlTyped('Kyiv') }),
        new FormGroupTyped({ city: new FormControlTyped('Mykolaiv') }),
      ];
      expected = [{ city: 'Kyiv' }, { city: 'Mykolaiv' }];
      map.set(param, expected);

      map.forEach((exp, par) => {
        expect(() => new FormArrayTyped(par)).not.toThrow();

        const value = new FormArrayTyped(par).value;
        expect(value).toEqual(exp);
      });
    });
  });

  xdescribe('checking types only', () => {});
});
