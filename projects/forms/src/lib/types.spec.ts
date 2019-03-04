import { FormArrayTyped as FormArray } from './form-array-typed';
import { FormGroupTyped as FormGroup } from './form-group-typed';
import { FormControlTyped as FormControl } from './form-control-typed';
import { ControlType, Control } from './types';

xdescribe('checking types only', () => {
  // tslint:disable: prefer-const

  class Model1 {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  class Model2 extends Control {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  describe('ControlOfFormGroup', () => {
    it('should return FormArray<Model> type', () => {
      let valueWithType: ControlType<Model1[]>;
      const formArray: FormArray<Model1> = valueWithType;
    });

    it('should return FormGroup<Model>', () => {
      let valueWithType: ControlType<Model1>;
      const formGroup: FormGroup<Model1> = valueWithType;
    });

    it('should return FormControl<Model>', () => {
      let valueWithType: ControlType<Model2>;
      const formControl: FormControl<Model2> = valueWithType;
    });

    it('should return FormControl<string>', () => {
      let valueWithType: ControlType<string>;
      const formControl: FormControl<string> = valueWithType;
    });
  });
});
