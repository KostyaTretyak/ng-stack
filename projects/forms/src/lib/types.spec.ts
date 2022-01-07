import { FormArray } from './form-array';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';
import {
  ControlType,
  FbControlConfig,
  FbControl,
  Control,
  ExtractGroupValue,
  ExtractGroupStateValue,
  ExtractModelValue,
  ExtractControlValue,
  FormControlState,
} from './types';

xdescribe('checking types only', () => {
  // tslint:disable: prefer-const

  class Model {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  describe('Control of FormGroup', () => {
    describe('ControlType', () => {
      it('should return FormArray<Model> type', () => {
        let valueWithType: ControlType<Model[]> = {} as any;
        const formArray: FormArray<Model> = valueWithType;
      });

      it('should return FormControl<Model>', () => {
        let valueWithType: ControlType<Control<Model>> = {} as any;
        const formControl: FormControl<Model> = valueWithType;
      });

      it('should return FormControl<string[]>', () => {
        let valueWithType: ControlType<Control<string[]>> = {} as any;
        const formControl: FormControl<string[]> = valueWithType;
      });

      it('should return FormGroup<Model>', () => {
        let valueWithType: ControlType<Model> = {} as any;
        const formGroup: FormGroup<Model> = valueWithType;
      });

      it('should return FormControl<string>', () => {
        let valueWithType: ControlType<string> = {} as any;
        const formControl: FormControl<string> = valueWithType;
      });
    });

    describe('ExtractControlValue', () => {
      it('case 1', () => {
        let value: ExtractControlValue<string> = '';
        const val: string = value;
      });

      it('case 2', () => {
        let value: ExtractControlValue<string[]> = [''];
        const val: string[] = value;
      });

      it('case 3', () => {
        let value: ExtractControlValue<boolean> = true;
        const val: boolean = value;
      });

      it('case 4', () => {
        let value: ExtractControlValue<boolean[]> = [true];
        const val: boolean[] = value;
      });

      it('case 5', () => {
        let value: ExtractControlValue<{ one: string }> = {one: ''};
        const val: { one: string } = value;
      });

      it('case 6', () => {
        let value: ExtractControlValue<Control<string[]>> = ['one'];
        const val: string[] = value;
      });

      it('case 7', () => {
        let value: ExtractControlValue<Control<boolean[]>> = [true];
        const val: boolean[] = value;
      });

      it('case 8', () => {
        let value: ExtractControlValue<Control<{ one: string }>> = { one: 'val' };
        const val: { one: string } = value;
      });

      it('case 9', () => {
        let value: ExtractControlValue<{ one: Control<string[]> }> = { one: [''] } as any;
        const val: { one: string[] } = value;
      });
    });

    describe('FormControlState<T>', () => {
      let value1: FormControlState<string>;
      value1 = '';
      value1 = { value: '', disabled: false };
    });

    describe('ControlValue', () => {
      it('should clear value outside an object (for FormControl)', () => {
        interface FormModel {
          one: string;
        }
        let value: ExtractGroupValue<Control<FormModel>> = {} as any;
        const obj1: FormModel = value;
        const str1: string = value.one;
        const control = new FormControl<FormModel>(value);
        const obj2: FormModel = control.value;
        const str2: string = control.value.one;
      });

      it('should clear value inside an object (for FormGroup)', () => {
        interface FormModel {
          one: Control<string[]>;
        }
        let value: ExtractGroupValue<FormModel>= {} as any;
        const arr1: string[] = value.one;
      });
    });

    describe('ExtractFormValue', () => {
      it('case 1', () => {
        let value: ExtractModelValue<any>;
        const val1: string = value;
        const val2: number = value;
        const val3: string[] = value;
        const val4: { one: 1 } = value;
      });

      it('case 2', () => {
        let value: ExtractModelValue<string> = '';
        const val: string = value;
      });

      it('case 3', () => {
        let value: ExtractModelValue<string[]> = ['one']
        const val: string[] = value;
      });

      it('case 4', () => {
        interface FormModel {
          one: string[];
        }
        let value: ExtractModelValue<Control<FormModel>[]> = {} as any;
        const val: FormModel[] = value;
      });

      it('case 5', () => {
        interface FormModel {
          one: Control<string[]>;
        }
        let value: ExtractModelValue<FormModel> = ['one'] as any;
        const val: string[] = value.one;
      });

      it('case 6', () => {
        interface FormModel {
          value: { other: string; city: string; street: string };
          disabled: false;
        }
        let value: ExtractModelValue<FormModel> = {} as any;
        const val: FormModel = value;
      });
    });

    describe('FormGroupState', () => {
      it('case 1', () => {
        let some: ExtractGroupStateValue<{ one: number }> = {} as any;;
        some.one = 1;
        some.one = { value: 1, disabled: true };
      });
    });

    type T1 = ControlType<any>;
    type T2 = ControlType<boolean>;
    type T3 = ControlType<true>;
    type T4 = ControlType<'one' | 'two'>;
    type T5 = ControlType<{ one: string; two: number }>;
  });

  describe('Control of FormBuilder', () => {
    it('should return FormArray<Model> type', () => {
      let valueWithType: FbControlConfig<Model[]> = {} as any;
      const formArray: FormArray<Model> = valueWithType;
    });

    it('should return FbControl<Model>', () => {
      let valueWithType: FbControlConfig<Control<Model>> = {} as any;
      const formControl: FbControl<Model> = valueWithType;
    });

    it('should return FormGroup<Model>', () => {
      let valueWithType: FbControlConfig<Model>;
      const formGroup: FormGroup<Model> = valueWithType = {} as any;
    });

    it('should return FbControl<string>', () => {
      let valueWithType: FbControlConfig<string>;
      const fbControl: FbControl<string> = valueWithType = {} as any;
    });

    type T1 = FbControlConfig<any>;
    type T2 = FbControlConfig<boolean>;
    type T3 = FbControlConfig<true>;
    type T4 = FbControlConfig<'one' | 'two'>;
    type T5 = FbControlConfig<{ one: string; two: number }>;
  });
});
