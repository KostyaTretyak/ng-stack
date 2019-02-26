import { AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { OnlyStringKeyOf, ControlType, ObjectAny } from './types';

export abstract class AbstractControlTyped<T = any> extends AbstractControl {
  readonly value: T;
  readonly valueChanges: Observable<T>;

  get<K extends OnlyStringKeyOf<T>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
  }

  abstract setValue(value: T, options?: ObjectAny): void;
  abstract patchValue(value: Partial<T>, options?: ObjectAny): void;
  abstract reset(value?: T, options?: ObjectAny): void;
}
