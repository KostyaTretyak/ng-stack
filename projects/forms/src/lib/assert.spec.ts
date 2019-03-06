import { Fn, isString, isNumber, isBoolean, isSymbol, isFunction, isObject, isArray } from './assert';

// Uncomment some row to see that tsc checking types correctly.

describe('assertions', () => {
  let value: any;

  it('should not to throw when assert string', () => {
    expect(callback).not.toThrow();

    function callback() {
      value = '';
      isString(value as string);
      // isString(value as any);
      // isString(null);
      // isString(undefined);
      // isString(value as number);
      // isString(value as boolean);
      // isString(value as symbol);
      // isString(value as object);
      // isString(value as Fn);
    }
  });

  it('should not to throw when assert number', () => {
    expect(callback).not.toThrow();

    function callback() {
      value = 1;
      isNumber(value as number);
      // isNumber(value as any);
      // isNumber(null);
      // isNumber(undefined);
      // isNumber(value as string);
      // isNumber(value as boolean);
      // isNumber(value as symbol);
      // isNumber(value as object);
      // isNumber(value as Fn);
    }
  });

  it('should not to throw when assert boolean', () => {
    expect(callback).not.toThrow();

    function callback() {
      value = true;
      isBoolean(value as boolean);
      // isBoolean(value as any);
      // isBoolean(null);
      // isBoolean(undefined);
      // isBoolean(value as string);
      // isBoolean(value as number);
      // isBoolean(value as symbol);
      // isBoolean(value as object);
      // isBoolean(value as Fn);
    }
  });

  it('should not to throw when assert symbol', () => {
    expect(callback).not.toThrow();

    function callback() {
      value = Symbol();
      isSymbol(value as symbol);
      // isSymbol(value as any);
      // isSymbol(null);
      // isSymbol(undefined);
      // isSymbol(value as string);
      // isSymbol(value as number);
      // isSymbol(value as boolean);
      // isSymbol(value as object);
      // isSymbol(value as Fn);
    }
  });

  it('should not to throw when assert Function', () => {
    expect(callback).not.toThrow();

    function callback() {
      value = () => {};
      isFunction(value as Fn);
      // isFunction(value as any);
      // isFunction(null);
      // isFunction(undefined);
      // isFunction(value as string);
      // isFunction(value as number);
      // isFunction(value as boolean);
      // isFunction(value as symbol);
      // isFunction(value as object);
    }
  });

  it('should not to throw when assert array', () => {
    expect(callback).not.toThrow();

    function callback() {
      value = [];
      isArray(value as any[]);
      // isArray(value as object);
      // isObject(value as Fn);
      // isObject(value as any);
      // isObject(null);
      // isObject(undefined);
      // isObject(value as string);
      // isObject(value as number);
      // isObject(value as boolean);
      // isObject(value as symbol);
    }
  });

  it('should not to throw when assert object', () => {
    expect(callback).not.toThrow();

    function callback() {
      value = {};
      isObject(value as object);
      // isObject(value as any[]);
      // isObject(value as Fn);
      // isObject(value as any);
      // isObject(null);
      // isObject(undefined);
      // isObject(value as string);
      // isObject(value as number);
      // isObject(value as boolean);
      // isObject(value as symbol);
    }
  });
});
