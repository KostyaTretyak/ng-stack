import { FormGroupTyped as FormGroup } from './form-group-typed';
import { FormArrayTyped as FormArray } from './form-array-typed';
import { FormControlTyped as FormControl } from './form-control-typed';
import { isObject, isString } from './assert';
import { Control } from './types';
import { Validators } from '@angular/forms';
import { tick, fakeAsync, async, inject } from '@angular/core/testing';

fdescribe('FormGroup', () => {
  class Address extends Control {
    city: string;
    street: string;
  }

  class Other {
    children: number;
  }

  class Profile {
    firstName: string;
    address: Address;
    other: Other;
  }

  xdescribe('checking types only', () => {});

  describe(`checking runtime work`, () => {
    // tslint:disable: no-shadowed-variable
    describe('value', () => {
      it('should be the reduced value of the child controls', () => {
        const g = new FormGroup({ one: new FormControl('111'), two: new FormControl('222') });
        expect(g.value).toEqual({ one: '111', two: '222' });
      });

      it('should be empty when there are no child controls', () => {
        const g = new FormGroup({});
        expect(g.value).toEqual({});
      });

      it('should support nested groups', () => {
        const g = new FormGroup({
          one: new FormControl('111'),
          nested: new FormGroup({ two: new FormControl('222') }),
        });
        expect(g.value).toEqual({ one: '111', nested: { two: '222' } });

        g.get('nested')
          .get('two')
          .setValue('333');

        expect(g.value).toEqual({ one: '111', nested: { two: '333' } });
      });
    });

    describe('getRawValue', () => {
      class Model {
        c1: string;
        group: { c2: string; c3: string };
        array: string[];
      }
      let fg: FormGroup<Model>;

      it('should work with nested form groups/arrays', () => {
        fg = new FormGroup<Model>({
          c1: new FormControl('v1'),
          group: new FormGroup({ c2: new FormControl('v2'), c3: new FormControl('v3') }),
          array: new FormArray([new FormControl('v4'), new FormControl('v5')]),
        });
        // tslint:disable-next-line: no-non-null-assertion
        fg.get('group')
          .get('c3')
          .disable();

        fg.get('array')
          .at(1)
          .disable();

        expect(fg.getRawValue()).toEqual({ c1: 'v1', group: { c2: 'v2', c3: 'v3' }, array: ['v4', 'v5'] });
      });
    });

    describe('adding and removing controls', () => {
      it('should update value and validity when control is added', () => {
        const g = new FormGroup<{ one: string; two?: string }>({ one: new FormControl('1') });
        expect(g.value).toEqual({ one: '1' });
        expect(g.valid).toBe(true);

        g.addControl('two', new FormControl('2', Validators.minLength(10)));

        expect(g.value).toEqual({ one: '1', two: '2' });
        expect(g.valid).toBe(false);
      });

      it('should update value and validity when control is removed', () => {
        const g = new FormGroup<any>({
          one: new FormControl('1'),
          two: new FormControl('2', Validators.minLength(10)),
        });
        expect(g.value).toEqual({ one: '1', two: '2' });
        expect(g.valid).toBe(false);

        g.removeControl('two');

        expect(g.value).toEqual({ one: '1' });
        expect(g.valid).toBe(true);
      });
    });

    describe('setValue', () => {
      let c: FormControl;
      let c2: FormControl;
      let g: FormGroup;

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

      describe('patchValue', () => {
        let c: FormControl;
        let c2: FormControl;
        let g: FormGroup;

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

        describe('getError', () => {
          it('should return the error when it is present', () => {
            const c = new FormControl('', Validators.required);
            const g = new FormGroup({ one: c });
            expect(c.getError('required')).toEqual(true);
            expect(g.getError('required', 'one')).toEqual(true);
          });

          it('should return null otherwise', () => {
            const c = new FormControl('not empty', Validators.required);
            const g = new FormGroup({ one: c });
            expect(c.getError('invalid')).toEqual(null);
            expect(g.getError('required', 'one')).toEqual(null);
            expect(g.getError('required', 'invalid' as any)).toEqual(null);
          });

          it('should be able to traverse group with single string', () => {
            const c = new FormControl('', Validators.required);
            const g = new FormGroup({ one: c });
            expect(c.getError('required')).toEqual(true);
            expect(g.getError('required', 'one')).toEqual(true);
          });

          it('should be able to traverse group with string delimited by dots', () => {
            const c = new FormControl('', Validators.required);
            const g2 = new FormGroup({ two: c });
            const g1 = new FormGroup({ one: g2 });
            expect(c.getError('required')).toEqual(true);
            expect(g1.get('one').getError('required', 'two')).toEqual(true);
          });

          it('should traverse group with form array using string and numbers', () => {
            const c = new FormControl('', Validators.required);
            const g2 = new FormGroup({ two: c });
            const a = new FormArray([g2]);
            const g1 = new FormGroup<{ one: { two: string }[] }>({ one: a });
            expect(c.getError('required')).toEqual(true);
            expect(
              g1
                .get('one')
                .get('0')
                .getError('required', 'two')
            ).toEqual(true);
          });
        });

        describe('hasError', () => {
          it('should return true when it is present', () => {
            const c = new FormControl('', Validators.required);
            const g = new FormGroup({ one: c });
            expect(c.hasError('required')).toEqual(true);
            expect(g.hasError('required', 'one')).toEqual(true);
          });

          it('should return false otherwise', () => {
            const c = new FormControl('not empty', Validators.required);
            const g = new FormGroup({ one: c });
            expect(c.hasError('invalid')).toEqual(false);
            expect(g.hasError('required', 'one')).toEqual(false);
            expect(g.hasError('required', 'invalid' as any)).toEqual(false);
          });

          it('should be able to traverse group with single string', () => {
            const c = new FormControl('', Validators.required);
            const g = new FormGroup({ one: c });
            expect(c.hasError('required')).toEqual(true);
            expect(g.hasError('required', 'one')).toEqual(true);
          });

          it('should be able to traverse group with string delimited by dots', () => {
            const c = new FormControl('', Validators.required);
            const g2 = new FormGroup({ two: c });
            const g1 = new FormGroup({ one: g2 });
            expect(c.hasError('required')).toEqual(true);
            expect(g1.get('one').hasError('required', 'two')).toEqual(true);
          });
          it('should traverse group with form array using string and numbers', () => {
            const c = new FormControl('', Validators.required);
            const g2 = new FormGroup({ two: c });
            const a = new FormArray([g2]);
            const g1 = new FormGroup<{ one: { two: string }[] }>({ one: a });
            expect(c.getError('required')).toEqual(true);
            expect(
              g1
                .get('one')
                .get('0')
                .getError('required', 'two')
            ).toEqual(true);
          });
        });

        describe('setControl()', () => {
          let c: FormControl;
          let g: FormGroup;

          beforeEach(() => {
            c = new FormControl('one');
            g = new FormGroup({ one: c });
          });

          it('should replace existing control with new control', () => {
            const c2 = new FormControl('new!', Validators.minLength(10));
            g.setControl('one', c2);

            expect(g.controls.one).toEqual(c2);
            expect(g.value).toEqual({ one: 'new!' });
            expect(g.valid).toBe(false);
          });

          it('should add control if control did not exist before', () => {
            const c2 = new FormControl('new!', Validators.minLength(10));
            g.setControl('two', c2);

            expect(g.controls.two).toEqual(c2);
            expect(g.value).toEqual({ one: 'one', two: 'new!' });
            expect(g.valid).toBe(false);
          });

          it('should remove control if new control is null', () => {
            g.setControl('one', null);
            expect(g.controls.one).not.toBeDefined();
            expect(g.value).toEqual({});
          });

          it('should only emit value change event once', () => {
            const logger: string[] = [];
            const c2 = new FormControl('new!');
            g.valueChanges.subscribe(() => logger.push('change!'));
            g.setControl('one', c2);
            expect(logger).toEqual(['change!']);
          });
        });
      });

      describe('reset()', () => {
        let c: FormControl;
        let c2: FormControl;
        let g: FormGroup;

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
          let form: FormGroup;
          let c3: FormControl;
          let logger: any[];

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
});
