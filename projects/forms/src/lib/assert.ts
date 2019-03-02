import * as assert from 'assert-plus';

export type Diff<T, X> = T extends X ? never : T;

export type hasType<T, U> = Diff<T, Extract<T, never>> & U;
export type Fn = (...args: any[]) => any;
export type NonFn<T> = Diff<T, Fn>;
export type IsArray<T> = T extends (infer Item)[] ? Item : never;
export type NonArray<T> = Diff<T, IsArray<T>>;

// A bit rewrited TypeScript definitions for the type checking functions.

export function isString<T>(value: hasType<T, string>) {
  assert.string(value);
}

export function isNumber<T>(value: hasType<T, number>) {
  assert.number(value);
}

export function isBoolean<T>(value: hasType<T, boolean>) {
  assert.bool(value);
}

export function isFunction<T>(value: hasType<T, Fn>) {
  assert.func(value);
}

export function isArray<T>(value: hasType<T, any[]>) {
  assert.array(value);
}

export function isObject<T>(value: hasType<NonFn<T> & NonArray<T>, object>) {
  assert.object(value);
}

export function isSymbol<T>(value: hasType<T, symbol>) {
  if (typeof value != 'symbol') {
    throw new TypeError(`${typeof value} (symbol) is required`);
  }
}

export function isNever(value: never) {
  if (value !== undefined) {
    throw new TypeError(`${typeof value} (undefined) is required`);
  }
}
