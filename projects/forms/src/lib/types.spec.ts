import { FormArrayTyped } from './form-array-typed';
import { FormGroupTyped } from './form-group-typed';
import { FormControlTyped } from './form-control-typed';
import { ControlType, FormControlObject } from './types';

xdescribe('checking types only', () => {
  // tslint:disable: prefer-const

  class Model {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  describe('ControlOfFormGroup', () => {
    it('should return FormArrayTyped<Model> type', () => {
      let valueWithType: ControlType<Model[]>;
      const formArray: FormArrayTyped<Model> = valueWithType;
    });

    it('should return FormGroupTyped<Model>', () => {
      let valueWithType: ControlType<Model>;
      const formGroup: FormGroupTyped<Model> = valueWithType;
    });

    it('should return FormControlTyped<Model>', () => {
      let valueWithType: ControlType<FormControlObject<Model>>;
      const formControl: FormControlTyped<Model> = valueWithType;
    });

    it('should return FormControlTyped<string>', () => {
      let valueWithType: ControlType<string>;
      const formControl: FormControlTyped<string> = valueWithType;
    });
  });
});
