import { FormArray } from './form-array';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';
import { ControlType, Control } from './types';

xdescribe('checking types only', () => {
  // tslint:disable: prefer-const

  class Model {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  describe('ControlOfFormGroup', () => {
    it('should return FormArray<Model> type', () => {
      let valueWithType: ControlType<Model[]>;
      const formArray: FormArray<Model> = valueWithType;
    });

    it('should return FormGroup<Model>', () => {
      let valueWithType: ControlType<Model>;
      const formGroup: FormGroup<Model> = valueWithType;
    });

    it('should return FormControl<Model>', () => {
      let valueWithType: ControlType<Control<Model>>;
      const formControl: FormControl<Model> = valueWithType;
    });

    it('should return FormControl<string>', () => {
      let valueWithType: ControlType<string>;
      const formControl: FormControl<string> = valueWithType;
    });

    type T1 = ControlType<any>;
    type T2 = ControlType<true>;
    type T3 = ControlType<'one' | 'two'>;
    type T4 = ControlType<{ one: string; two: number }>;
  });
});
