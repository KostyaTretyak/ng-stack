import { FormArrayTyped as FormArray } from './form-array-typed';
import { FormGroupTyped as FormGroup } from './form-group-typed';
import { FormControlTyped as FormControl } from './form-control-typed';
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
  });
});
