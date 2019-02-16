import { pickAllPropertiesAsGetters, pickPropertiesAsGetters } from './pick-properties';

describe('pickAllPropertiesAsGetters', () => {
  it('signature1: result = pickAllPropertiesAsGetters(targetObj, sourceObj)', () => {
    const targetObj = { one: null };
    const sourceObj = { one: 1, two: 2 };
    const result = pickAllPropertiesAsGetters(targetObj, sourceObj);
    expect(targetObj).toBe(result);
    expect(sourceObj).toEqual({ one: 1, two: 2 }, 'immutable source object');
    expect(targetObj.one).toBe(1);
    sourceObj.one = 11;
    expect(targetObj.one).toBe(11);
    expect(targetObj).toBe(result);
  });

  it('signature2: targetObj = pickAllPropertiesAsGetters(sourceObj)', () => {
    const sourceObj = { one: null };
    const targetObj = pickAllPropertiesAsGetters(sourceObj);
    expect(sourceObj).not.toBe(targetObj);
    expect(sourceObj.one).toBe(null);
    expect(targetObj.one).toBe(null);
    sourceObj.one = 11;
    expect(targetObj.one).toBe(11);
  });

  it('signature3: result = pickAllPropertiesAsGetters(targetObj, sourceObj1, sourceObj2)', () => {
    const targetObj = { one: null, two: null, other: null };
    const sourceObj1 = { one: 1, two: 2, other: 'other value' };
    const sourceObj2 = { one: 11, two: 22 };
    const result = pickAllPropertiesAsGetters(targetObj, sourceObj1, sourceObj2);
    expect(targetObj).toBe(result);
    expect(sourceObj1).toEqual({ one: 1, two: 2, other: 'other value' }, 'immutable source object');
    expect(sourceObj2).toEqual({ one: 11, two: 22 }, 'immutable source object');
    expect(targetObj.one).toBe(11, 'value from sourceObj2');
    expect(targetObj.two).toBe(22, 'value from sourceObj2');
    expect(targetObj.other).toBe('other value', 'value from sourceObj1');
    sourceObj1.one = 111;
    sourceObj1.two = 222;
    sourceObj1.other = 'some thing else';
    expect(targetObj.one).toBe(11, 'should be without changes');
    expect(targetObj.two).toBe(22, 'should be without changes');
    expect(targetObj.other).toBe('some thing else', 'should be with changes from sourceObj1');
    sourceObj2.one = 1010;
    sourceObj2.two = 2020;
    expect(targetObj.one).toBe(1010, 'should be with changes from sourceObj2');
    expect(targetObj.two).toBe(2020, 'should be with changes from sourceObj2');
    expect(targetObj).toBe(result);
  });
});

describe('pickPropertiesAsGetters', () => {
  it('signature1: result = pickPropertiesAsGetters(targetObj, null, sourceObj)', () => {
    const targetObj = { one: null };
    const sourceObj = { one: 1, two: 2 };
    const result = pickPropertiesAsGetters(targetObj, null, sourceObj);
    expect(targetObj).toBe(result);
    expect(sourceObj).toEqual({ one: 1, two: 2 }, 'immutable source object');
    expect(targetObj.one).toBe(1);
    sourceObj.one = 11;
    expect(targetObj.one).toBe(11);
    expect(targetObj).toBe(result);
  });

  it(`signature2: result = pickPropertiesAsGetters(targetObj, { includeProperties:... }, sourceObj)`, () => {
    const targetObj = { one: null, two: null };
    const sourceObj = { one: 1, two: 2 };
    const result = pickPropertiesAsGetters(targetObj, { includeProperties: ['one'] }, sourceObj);
    expect(targetObj).toBe(result);
    expect(sourceObj).toEqual({ one: 1, two: 2 }, 'immutable source object');
    expect(targetObj.one).toBe(1);
    expect(targetObj.two).toBe(null);
    sourceObj.one = 11;
    sourceObj.two = 22;
    expect(targetObj.one).toBe(11);
    expect(targetObj.two).toBe(null);
    expect(targetObj).toBe(result);
  });

  it(`signature3: result = pickPropertiesAsGetters(targetObj, { excludeProperties:... }, sourceObj)`, () => {
    const targetObj = { one: null, two: null };
    const sourceObj = { one: 1, two: 2 };
    const result = pickPropertiesAsGetters(targetObj, { excludeProperties: ['one'] }, sourceObj);
    expect(targetObj).toBe(result);
    expect(sourceObj).toEqual({ one: 1, two: 2 }, 'immutable source object');
    expect(targetObj.one).toBe(null);
    expect(targetObj.two).toBe(2);
    sourceObj.one = 11;
    sourceObj.two = 22;
    expect(targetObj.one).toBe(null);
    expect(targetObj.two).toBe(22);
    expect(targetObj).toBe(result);
  });

  it(`signature4: result = pickPropertiesAsGetters(targetObj, { excludeProperties:..., includeProperties:... }, sourceObj)`, () => {
    const targetObj = { one: null, two: null };
    const sourceObj = { one: 1, two: 2 };
    const result = pickPropertiesAsGetters(
      targetObj,
      { excludeProperties: ['one'], includeProperties: ['one', 'two'] },
      sourceObj
    );
    expect(targetObj).toBe(result);
    expect(sourceObj).toEqual({ one: 1, two: 2 }, 'immutable source object');
    expect(targetObj.one).toBe(null);
    expect(targetObj.two).toBe(2);
    sourceObj.one = 11;
    sourceObj.two = 22;
    expect(targetObj.one).toBe(null);
    expect(targetObj.two).toBe(22);
    expect(targetObj).toBe(result);
  });
});
