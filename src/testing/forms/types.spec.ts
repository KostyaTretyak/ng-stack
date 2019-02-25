import { Validators } from '@angular/forms';

import { FormBuilderTyped } from '@ng-stack/forms';

class C1 {
  one: string;
  two: string;
  three: string;
  four: boolean;
  five: number;
  six: string;
}

declare const fb: FormBuilderTyped;

const control1 = fb.control(12); // OK, returns FormControlTyped<any>
fb.control({ value: 12, disabled: false }); // OK
fb.control({ value: '12', disabled: false }); // OK
fb.control({ value: '12' }); // OK
fb.control<C1>('some value'); // Expected 2 type arguments, but got 1.
const control2 = fb.control<C1, 'one'>('some value'); // OK, returns FormControlTyped<string>
fb.control<C1, 'one'>(12); // Argument of type '12' is not assignable...
fb.control<C1, 'one'>({ value: '12' }); // Property 'disabled' is missing in type '{ value: string; }'...
fb.control<C1, 'one'>({ value: '12', disabled: false }); // OK
fb.control<C1, 'one'>({ value: 12, disabled: false }); // Type 'number' is not assignable to type 'string'.
const control3 = fb.control<C1, 'five'>(12); // OK, returns FormControlTyped<number>
fb.control<C1, 'notExistingProperty'>(12); // OK, but it's wrong...

// Passing class C1 to the generic of ControlsConfig.
fb.group<C1>({
  one: null, // OK
  two: [null, Validators.required, Validators.composeAsync('fd' as any)], // OK
  three: [null, 1, '2', 3], // Error, but it's not exactly needed error
  four: false, // OK
  five: '2', // Type 'string' is not assignable to type 'number...
  six: [null, Validators.required, Validators.required], // Error, but it's not exactly needed error
  notExistingProperty: 'value', // OK, but it's wrong...
});

// Passing any (default) to the generic of ControlsConfig.
fb.group<any>({
  one: null, // OK
  two: [null, Validators.required, Validators.composeAsync('fd' as any)], // OK
  twotwo: [null, Validators.required, Validators.required], // OK, but it's wrong...
  three: [null, 1, '2', 3], // OK, but it's wrong...
  four: false, // OK
  five: '2', // OK, but it's wrong...
  notExistingProperty: 'value', // OK, but it's wrong...
});
