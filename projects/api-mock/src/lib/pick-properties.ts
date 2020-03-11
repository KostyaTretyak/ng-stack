import { ObjectAny } from './types';

export function pickProperties<T extends ObjectAny>(targetObject: T, ...sourceObjects: ObjectAny[]) {
  sourceObjects.forEach(sourceObj => {
    Object.keys(targetObject).forEach(prop => {
      if (sourceObj.hasOwnProperty(prop)) {
        (targetObject as any)[prop] = sourceObj[prop];
      }
    });
  });

  return targetObject;
}

/**
 * Pick all properties from a `targetObject` and replace
 * them with getters that takes values from corresponding properties of `sourceObjects`.
 * This is symplified version of `pickPropertiesAsGetters()`.
 *
 * If one of `sourceObjects` is equal to `targetObject`,
 * from start the function will do this:
 *
```ts
targetObject = JSON.parse(JSON.stringify(targetObject));
```
 */
export function pickAllPropertiesAsGetters<T extends ObjectAny>(targetObject: T, ...sourceObjects: ObjectAny[]) {
  if (sourceObjects.length) {
    return pickPropertiesAsGetters(targetObject, null, ...sourceObjects);
  }
  return pickPropertiesAsGetters(targetObject, null, targetObject);
}

/**
 * Pick given properties from a `targetObject` and replace
 * them with getters that takes values from corresponding properties of `sourceObjects`.
 *
 * If one of `sourceObjects` is equal to `targetObject`,
 * from start the function will do this:
 *
```ts
targetObject = JSON.parse(JSON.stringify(targetObject));
```
 */
export function pickPropertiesAsGetters<T extends ObjectAny, K extends keyof T>(
  targetObject: T,
  properties: { includeProperties?: K[]; excludeProperties?: K[] },
  ...sourceObjects: ObjectAny[]
) {
  properties = properties || {};
  const incl: Array<K | string> = properties.includeProperties;
  const excl = properties.excludeProperties;

  for (const sourceObj of sourceObjects) {
    if (targetObject === sourceObj) {
      targetObject = JSON.parse(JSON.stringify(targetObject));
      break;
    }
  }

  sourceObjects.forEach(sourceObj => {
    Object.keys(targetObject)
      .filter(callback as any)
      .forEach(prop => {
        if (sourceObj.hasOwnProperty(prop)) {
          Object.defineProperty(targetObject, prop, {
            get() {
              return sourceObj[prop];
            },
          });
        }
      });
  });

  return targetObject;

  function callback(property: K) {
    if (incl && excl) {
      return incl.includes(property) && !excl.includes(property);
    } else if (incl) {
      return incl.includes(property);
    } else if (excl) {
      return !excl.includes(property);
    } else {
      return true;
    }
  }
}
