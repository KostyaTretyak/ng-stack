import { pickAllPropertiesAsGetters, pickProperties, pickPropertiesAsGetters } from './pick-properties';

fdescribe('pickAllPropertiesAsGetters', () => {
  it('should pick property "one" from sourceObj to targetObj', () => {
    const targetObj = { one: null };
    const sourceObj = { one: 1, two: 2 };
    const result = pickAllPropertiesAsGetters(targetObj, sourceObj);
    expect(targetObj).toEqual(result);
    expect(targetObj).toBe(result);
    expect(sourceObj).toEqual({ one: 1, two: 2 });
  });
});
describe('pickProperties', () => {});
describe('pickPropertiesAsGetters', () => {});
