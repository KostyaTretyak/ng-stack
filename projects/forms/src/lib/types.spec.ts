import { FormArray } from './form-array';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';
import { ControlType, FbControlConfig, FbControl } from './types';

xdescribe('checking types only', () => {
  // tslint:disable: prefer-const

  class Model {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  describe('Control of FormGroup', () => {
    it('should return FormArray<Model> type', () => {
      let valueWithType: ControlType<Model[]>;
      const formArray: FormArray<Model> = valueWithType;
    });

    it('should return FormGroup<Model>', () => {
      let valueWithType: ControlType<Model>;
      const formGroup: FormGroup<Model> = valueWithType;
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

  describe('Control of FormBuilder', () => {
    it('should return FormArray<Model> type', () => {
      let valueWithType: FbControlConfig<Model[]>;
      const formArray: FormArray<Model> = valueWithType;
    });

    it('should return FormGroup<Model>', () => {
      let valueWithType: FbControlConfig<Model>;
      const formGroup: FormGroup<Model> = valueWithType;
    });

    it('should return FbControl<string>', () => {
      let valueWithType: FbControlConfig<string>;
      const fbControl: FbControl<string> = valueWithType;
    });

    type T1 = FbControlConfig<any>;
    type T2 = FbControlConfig<true>;
    type T3 = FbControlConfig<'one' | 'two'>;
    type T4 = FbControlConfig<{ one: string; two: number }>;
  });
});
