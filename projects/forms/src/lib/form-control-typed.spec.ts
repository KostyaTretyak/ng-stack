import { FormControlTyped } from './form-control-typed';
import { isNumber, isString } from './types';

isString(new FormControlTyped<string>().value);
isString(new FormControlTyped({ value: '2', disable: false }).value);
isString(new FormControlTyped<string>('2').value);
isString(new FormControlTyped('2').value);

new FormControlTyped('2').valueChanges.subscribe(val => isString(val));
new FormControlTyped().setValue('some string');
new FormControlTyped('2').setValue('some string');
new FormControlTyped('2').setValue(null);
new FormControlTyped().patchValue('some string');
new FormControlTyped('2').patchValue('some string');
new FormControlTyped('2').patchValue(null);
new FormControlTyped('2').reset();
new FormControlTyped('2').reset({ value: '2', disable: false });
new FormControlTyped('2').get('some.path');

isNumber(new FormControlTyped<number>().value);
isNumber(new FormControlTyped({ value: 2, disable: false }).value);
isNumber(new FormControlTyped<number>(2).value);
isNumber(new FormControlTyped(2).value);

new FormControlTyped(2).valueChanges.subscribe(val => isNumber(val));
new FormControlTyped().setValue(22);
new FormControlTyped(2).setValue(22);
new FormControlTyped(2).setValue(null);
new FormControlTyped().patchValue(22);
new FormControlTyped(2).patchValue(22);
new FormControlTyped(2).patchValue(null);
new FormControlTyped(2).reset();
new FormControlTyped(2).reset({ value: 2, disable: false });
new FormControlTyped(2).get('some.path');
