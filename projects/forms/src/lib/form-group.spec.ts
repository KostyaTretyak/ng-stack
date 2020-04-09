import { FormGroup } from './form-group';
import { FormArray } from './form-array';
import { FormControl } from './form-control';
import { tick, fakeAsync } from '@angular/core/testing';
import { isString, isNumber, isObject, isArray } from './assert';
import { Control } from './types';

// tslint:disable: one-variable-per-declaration
// tslint:disable: no-unused-expression

describe('FormGroup', () => {
  class Address {
    city: string;
    street: string;
    numFlat?: number;
  }

  class SomeGroup {
    children: number;
  }

  class Profile {
    firstName: string;
    address: Control<Address>;
    someControlArray?: Control<string[]>;
    someGroup: SomeGroup;
    someArray: number[];
    someBoolean?: boolean;
    someNumber?: number;
    otheUnionType?: 'one' | 'two';
  }

  xdescribe('checking types only', () => {
    let formGroup: FormGroup<Profile>;

    it('constructor()', () => {
      formGroup = new FormGroup<Profile>({
        firstName: new FormControl('Kostia'),
        // firstName: new FormControl(2),
        // firstName: new FormControl(true),
        // firstName: new FormControl([]),
        // firstName: new FormControl({}),
        // firstName: new FormGroup({}),
        // firstName: new FormArray([]),
        address: new FormControl({
          value: { other: 'some value', city: 'Kyiv', street: 'Khreshchatyk' },
          disabled: false,
        }),
        someControlArray: new FormControl([]),
        someGroup: new FormGroup({ children: new FormControl(2) }),
        someArray: new FormArray<number>([
          new FormControl(1),
          new FormControl(2),
          new FormControl(3),
          // new FormControl('some string'),
          // new FormGroup({}),
        ]),
      });

      const formControl = new FormControl(true);
      const formControl1 = new FormControl('one');

      formGroup = new FormGroup<Profile>({
        someBoolean: formControl,
        // otheUnionType: formControl1,
      } as any);

      enum SomeEnum {
        first = 'one',
        second = 'two',
      }

      interface MyInterface {
        fieldOne: string;
        fieldTwo: SomeEnum;
      }

      const formGroup1 = new FormGroup<MyInterface>({
        fieldOne: new FormControl(),
        fieldTwo: new FormControl(SomeEnum.first),
      });
    });

    it('value', () => {
      isObject(formGroup.value);
      isString(formGroup.value.firstName);
      // isString(formGroup.value.other);
      isObject(formGroup.value.address);
      isString(formGroup.value.address.city);
      isNumber(formGroup.value.address.numFlat);
      isArray(formGroup.value.someArray);
    });

    it('registerControl()', () => {
      const control = formGroup.registerControl('firstName', new FormControl('Kostia'));
      // formGroup.registerControl('firstName', new FormGroup({}));
      // formGroup.registerControl('firstName', new FormControl(123));
      isString(control.value);

      const control2 = formGroup.registerControl('address', new FormControl(new Address()));
      // formGroup.registerControl('address', new FormGroup(new Address()));
      // formGroup.registerControl('address', new FormControl('some string');
      // formGroup.registerControl('address', new FormControl(123);
      // isObject(control2.value);
      // isString(control2.value.city);
      isNumber(control2.value.numFlat);
    });

    it('addControl()', () => {
      formGroup.addControl('firstName', new FormControl('Sofiya'));
      formGroup.addControl('address', new FormControl(new Address()));
      // formGroup.addControl('notExistingKey', new FormControl('some string'));
      // formGroup.addControl('firstName', new FormControl(123));
      // formGroup.addControl('firstName', new FormControl(true));
      // formGroup.addControl('firstName', new FormGroup({}));
    });

    it('removeControl()', () => {
      formGroup.removeControl('firstName');
      // formGroup.removeControl('notExistingKey');
    });

    it('setControl()', () => {
      formGroup.setControl('firstName', new FormControl('Kostia'));
      // formGroup.setControl('firstName', new FormGroup({}));
      // formGroup.setControl('firstName', new FormControl(123));

      formGroup.setControl('address', new FormControl(new Address()));
      // formGroup.setControl('address', new FormGroup(new Address()));
      // formGroup.setControl('address', new FormControl('some string');
      // formGroup.setControl('address', new FormControl(123);
    });

    it('contains()', () => {
      formGroup.contains('firstName');
      // formGroup.contains('notExistingKey');
    });

    it('setValue()', () => {
      formGroup.setValue(new Profile());

      new FormControl().setValue(123);
      formGroup.get('firstName').setValue('some string');
      formGroup.get('address').setValue(new Address());
      // new FormGroup<{ firstName: string }>(null).get('firstName').setValue(123);
      // formGroup.get('firstName').setValue(123);
      // formGroup.get('someNumber').setValue([`it's wrong value`]);
      // formGroup.get('firstName').setValue({});
      // formGroup.setValue({ firstName: '' });
    });

    it('patchValue()', () => {
      formGroup.patchValue(new Profile());
      formGroup.patchValue({ firstName: '' });
      formGroup.get('firstName').patchValue('some string');
      formGroup.get('address').setValue(new Address());
      // formGroup.get('firstName').patchValue(123);
      // formGroup.patchValue({ firstName: 123 });
      // formGroup.patchValue(new Address());
    });

    it('reset()', () => {
      formGroup.reset();
      formGroup.reset(new Profile());
      // formGroup.reset({ firstName: '' });
      // formGroup.reset(new Address());
      // formGroup.reset('string');
      // formGroup.reset(123);
    });

    it('getRawValue()', () => {
      const formValue = formGroup.getRawValue();
      isObject(formValue);
      isString(formValue.firstName);
      // isString(formValue.notExistingKey);
      isArray(formValue.someArray);
    });

    it('get()', () => {
      isString(formGroup.get('firstName').value);
      // formGroup.get('notExistingKey');
      // isObject(formGroup.get('address').value);
      isObject(formGroup.get('someGroup').value);
      isArray(formGroup.get('someArray').value);

      const formControl1: FormControl<string> = formGroup.get('firstName');
      // const formControl2: FormControl<number> = formGroup.get('firstName');
      const formControl3: FormControl<Address> = formGroup.get('address');
      const formControl4: FormGroup<SomeGroup> = formGroup.get('someGroup');
    });

    it('getError()', () => {
      formGroup.getError('required', 'firstName');
      // formGroup.getError('required', 'notExistingKey');
      // formGroup.getError('notExistingErrorCode', 'address');
    });

    it('hasError()', () => {
      formGroup.hasError('required', 'firstName');
      // formGroup.hasError('required', 'notExistingKey');
      // formGroup.hasError('notExistingErrorCode', 'address');
    });

    it('nesting validation model', () => {
      interface FormGroupModel {
        control: string;
      }

      interface ValidModel1 {
        wrongPassword?: { returnedValue: boolean };
        wrongEmail?: { returnedValue: boolean };
      }

      interface ValidModel2 {
        wrongPassword?: { returnedValue: boolean };
        otherKey?: { returnedValue: boolean };
      }

      const form = new FormGroup<FormGroupModel, ValidModel1>({
        control: new FormControl<string, ValidModel2>('some value'),
      });

      const formError = form.getError('wrongEmail');
      const controlError = form.get('control').getError('email'); // Without error, but it's wrong.
    });
  });

  describe(`checking runtime work`, () => {
    describe('getRawValue', () => {
      let fg: FormGroup<Model>;
      class Model {
        c1: string;
        group: { c2: string; c3: string };
        array: string[];
      }

      it('should work with nested form groups/arrays', () => {
        fg = new FormGroup<Model>({
          c1: new FormControl('v1'),
          group: new FormGroup({ c2: new FormControl('v2'), c3: new FormControl('v3') }),
          array: new FormArray([new FormControl('v4'), new FormControl('v5')]),
        });

        fg.get('group')
          .get('c3')
          .disable();

        fg.get('array')
          .at(1)
          .disable();

        expect(fg.getRawValue()).toEqual({ c1: 'v1', group: { c2: 'v2', c3: 'v3' }, array: ['v4', 'v5'] });
      });
    });

    describe('setValue', () => {
      let c: FormControl, c2: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('');
        c2 = new FormControl('');
        g = new FormGroup({ one: c, two: c2 });
      });

      it('should set its own value', () => {
        g.setValue({ one: 'one', two: 'two' });
        expect(g.value).toEqual({ one: 'one', two: 'two' });
      });

      it('should set child values', () => {
        g.setValue({ one: 'one', two: 'two' });
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');
      });

      it('should set child control values if disabled', () => {
        c2.disable();
        g.setValue({ one: 'one', two: 'two' });
        expect(c2.value).toEqual('two');
        expect(g.value).toEqual({ one: 'one' });
        expect(g.getRawValue()).toEqual({ one: 'one', two: 'two' });
      });

      it('should set group value if group is disabled', () => {
        g.disable();
        g.setValue({ one: 'one', two: 'two' });
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');

        expect(g.value).toEqual({ one: 'one', two: 'two' });
      });

      it('should set parent values', () => {
        const form = new FormGroup({ parent: g });
        g.setValue({ one: 'one', two: 'two' });
        expect(form.value).toEqual({ parent: { one: 'one', two: 'two' } });
      });

      it('should not update the parent when explicitly specified', () => {
        const form = new FormGroup({ parent: g });
        g.setValue({ one: 'one', two: 'two' }, { onlySelf: true });

        expect(form.value).toEqual({ parent: { one: '', two: '' } });
      });

      it('should throw if fields are missing from supplied value (subset)', () => {
        expect(() =>
          g.setValue({
            one: 'one',
          })
        ).toThrowError(new RegExp(`Must supply a value for form control with name: 'two'`));
      });

      it('should throw if a value is provided for a missing control (superset)', () => {
        expect(() => g.setValue({ one: 'one', two: 'two', three: 'three' })).toThrowError(
          new RegExp(`Cannot find form control with name: three`)
        );
      });

      it('should throw if a value is not provided for a disabled control', () => {
        c2.disable();
        expect(() =>
          g.setValue({
            one: 'one',
          })
        ).toThrowError(new RegExp(`Must supply a value for form control with name: 'two'`));
      });

      it('should throw if no controls are set yet', () => {
        const empty = new FormGroup({});
        expect(() =>
          empty.setValue({
            one: 'one',
          })
        ).toThrowError(new RegExp(`no form controls registered with this group`));
      });

      describe('setValue() events', () => {
        let form: FormGroup;
        let logger: any[];

        beforeEach(() => {
          form = new FormGroup({ parent: g });
          logger = [];
        });

        it('should emit one valueChange event per control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          g.setValue({ one: 'one', two: 'two' });
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });

        it('should not fire an event when explicitly specified', fakeAsync(() => {
          form.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });
          g.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });
          c.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });

          g.setValue({ one: 'one', two: 'two' }, { emitEvent: false });
          tick();
        }));

        it('should emit one statusChange event per control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          g.setValue({ one: 'one', two: 'two' });
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });
      });
    });

    describe('patchValue', () => {
      let c: FormControl, c2: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('');
        c2 = new FormControl('');
        g = new FormGroup({ one: c, two: c2 });
      });

      it('should set its own value', () => {
        g.patchValue({ one: 'one', two: 'two' });
        expect(g.value).toEqual({ one: 'one', two: 'two' });
      });

      it('should set child values', () => {
        g.patchValue({ one: 'one', two: 'two' });
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');
      });

      it('should patch disabled control values', () => {
        c2.disable();
        g.patchValue({ one: 'one', two: 'two' });
        expect(c2.value).toEqual('two');
        expect(g.value).toEqual({ one: 'one' });
        expect(g.getRawValue()).toEqual({ one: 'one', two: 'two' });
      });

      it('should patch disabled control groups', () => {
        g.disable();
        g.patchValue({ one: 'one', two: 'two' });
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');
        expect(g.value).toEqual({ one: 'one', two: 'two' });
      });

      it('should set parent values', () => {
        const form = new FormGroup({ parent: g });
        g.patchValue({ one: 'one', two: 'two' });
        expect(form.value).toEqual({ parent: { one: 'one', two: 'two' } });
      });

      it('should not update the parent when explicitly specified', () => {
        const form = new FormGroup({ parent: g });
        g.patchValue({ one: 'one', two: 'two' }, { onlySelf: true });

        expect(form.value).toEqual({ parent: { one: '', two: '' } });
      });

      it('should ignore fields that are missing from supplied value (subset)', () => {
        g.patchValue({ one: 'one' });
        expect(g.value).toEqual({ one: 'one', two: '' });
      });

      it('should not ignore fields that are null', () => {
        g.patchValue({ one: null });
        expect(g.value).toEqual({ one: null, two: '' });
      });

      it('should ignore any value provided for a missing control (superset)', () => {
        g.patchValue({ three: 'three' });
        expect(g.value).toEqual({ one: '', two: '' });
      });

      describe('patchValue() events', () => {
        let form: FormGroup;
        let logger: any[];

        beforeEach(() => {
          form = new FormGroup({ parent: g });
          logger = [];
        });

        it('should emit one valueChange event per control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          g.patchValue({ one: 'one', two: 'two' });
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });

        it('should not emit valueChange events for skipped controls', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          g.patchValue({ one: 'one' });
          expect(logger).toEqual(['control1', 'group', 'form']);
        });

        it('should not fire an event when explicitly specified', fakeAsync(() => {
          form.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });
          g.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });
          c.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });

          g.patchValue({ one: 'one', two: 'two' }, { emitEvent: false });
          tick();
        }));

        it('should emit one statusChange event per control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          g.patchValue({ one: 'one', two: 'two' });
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });
      });
    });

    describe('reset()', () => {
      let c: FormControl, c2: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('initial value');
        c2 = new FormControl('');
        g = new FormGroup({ one: c, two: c2 });
      });

      it('should set its own value if value passed', () => {
        g.setValue({ one: 'new value', two: 'new value' });

        g.reset({ one: 'initial value', two: '' });
        expect(g.value).toEqual({ one: 'initial value', two: '' });
      });

      it('should set its own value if boxed value passed', () => {
        g.setValue({ one: 'new value', two: 'new value' });

        g.reset({ one: { value: 'initial value', disabled: false }, two: '' });
        expect(g.value).toEqual({ one: 'initial value', two: '' });
      });

      it('should clear its own value if no value passed', () => {
        g.setValue({ one: 'new value', two: 'new value' });

        g.reset();
        expect(g.value).toEqual({ one: null, two: null });
      });

      it('should set the value of each of its child controls if value passed', () => {
        g.setValue({ one: 'new value', two: 'new value' });

        g.reset({ one: 'initial value', two: '' });
        expect(c.value).toBe('initial value');
        expect(c2.value).toBe('');
      });

      it('should clear the value of each of its child controls if no value passed', () => {
        g.setValue({ one: 'new value', two: 'new value' });

        g.reset();
        expect(c.value).toBe(null);
        expect(c2.value).toBe(null);
      });

      it('should set the value of its parent if value passed', () => {
        const form = new FormGroup({ g });
        g.setValue({ one: 'new value', two: 'new value' });

        g.reset({ one: 'initial value', two: '' });
        expect(form.value).toEqual({ g: { one: 'initial value', two: '' } });
      });

      it('should clear the value of its parent if no value passed', () => {
        const form = new FormGroup({ g });
        g.setValue({ one: 'new value', two: 'new value' });

        g.reset();
        expect(form.value).toEqual({ g: { one: null, two: null } });
      });

      it('should not update the parent when explicitly specified', () => {
        const form = new FormGroup({ g });
        g.reset({ one: 'new value', two: 'new value' }, { onlySelf: true });

        expect(form.value).toEqual({ g: { one: 'initial value', two: '' } });
      });

      it('should mark itself as pristine', () => {
        g.markAsDirty();
        expect(g.pristine).toBe(false);

        g.reset();
        expect(g.pristine).toBe(true);
      });

      it('should mark all child controls as pristine', () => {
        c.markAsDirty();
        c2.markAsDirty();
        expect(c.pristine).toBe(false);
        expect(c2.pristine).toBe(false);

        g.reset();
        expect(c.pristine).toBe(true);
        expect(c2.pristine).toBe(true);
      });

      it('should mark the parent as pristine if all siblings pristine', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({ g, c3 });

        g.markAsDirty();
        expect(form.pristine).toBe(false);

        g.reset();
        expect(form.pristine).toBe(true);
      });

      it('should not mark the parent pristine if any dirty siblings', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({ g, c3 });

        g.markAsDirty();
        c3.markAsDirty();
        expect(form.pristine).toBe(false);

        g.reset();
        expect(form.pristine).toBe(false);
      });

      it('should mark itself as untouched', () => {
        g.markAsTouched();
        expect(g.untouched).toBe(false);

        g.reset();
        expect(g.untouched).toBe(true);
      });

      it('should mark all child controls as untouched', () => {
        c.markAsTouched();
        c2.markAsTouched();
        expect(c.untouched).toBe(false);
        expect(c2.untouched).toBe(false);

        g.reset();
        expect(c.untouched).toBe(true);
        expect(c2.untouched).toBe(true);
      });

      it('should mark the parent untouched if all siblings untouched', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({ g, c3 });

        g.markAsTouched();
        expect(form.untouched).toBe(false);

        g.reset();
        expect(form.untouched).toBe(true);
      });

      it('should not mark the parent untouched if any touched siblings', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({ g, c3 });

        g.markAsTouched();
        c3.markAsTouched();
        expect(form.untouched).toBe(false);

        g.reset();
        expect(form.untouched).toBe(false);
      });

      it('should retain previous disabled state', () => {
        g.disable();
        g.reset();

        expect(g.disabled).toBe(true);
      });

      it('should set child disabled state if boxed value passed', () => {
        g.disable();
        g.reset({ one: { value: '', disabled: false }, two: '' });

        expect(c.disabled).toBe(false);
        expect(g.disabled).toBe(false);
      });

      describe('reset() events', () => {
        let form: FormGroup, c3: FormControl, logger: any[];

        beforeEach(() => {
          c3 = new FormControl('');
          form = new FormGroup({ g, c3 });
          logger = [];
        });

        it('should emit one valueChange event per reset control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));
          c3.valueChanges.subscribe(() => logger.push('control3'));

          g.reset();
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });

        it('should not fire an event when explicitly specified', fakeAsync(() => {
          form.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });
          g.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });
          c.valueChanges.subscribe(value => {
            throw new Error('Should not happen');
          });

          g.reset({}, { emitEvent: false });
          tick();
        }));

        it('should emit one statusChange event per reset control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));
          c3.statusChanges.subscribe(() => logger.push('control3'));

          g.reset();
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });

        it('should emit one statusChange event per reset control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));
          c3.statusChanges.subscribe(() => logger.push('control3'));

          g.reset({ one: { value: '', disabled: true } });
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });
      });
    });
  });
});
