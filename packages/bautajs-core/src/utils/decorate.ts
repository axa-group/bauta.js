import { BautaJSInstance } from '../types';

export function checkExistence(instance: BautaJSInstance, name: string) {
  return name in instance;
}

export function checkDependencies(instance: BautaJSInstance, deps: string[]) {
  const missingDependencies = [];
  for (let i = 0; i < deps.length; i += 1) {
    if (!checkExistence(instance, deps[i])) {
      missingDependencies.push(`deps[i]`);
    }
  }
  if (missingDependencies.length > 0) {
    throw new Error(`Missing dependency ${missingDependencies.join(',')} on BautaJS instance.`);
  }
}

export function decorate(
  instance: BautaJSInstance,
  name: string | symbol,
  fn: any,
  dependencies?: string[]
) {
  if (Object.prototype.hasOwnProperty.call(instance, name)) {
    throw new Error(`${String(name)} already present on BautaJS instance.`);
  }

  if (dependencies) {
    checkDependencies(instance, dependencies);
  }

  if (fn && (typeof fn.getter === 'function' || typeof fn.setter === 'function')) {
    Object.defineProperty(instance, name, {
      get: fn.getter,
      set: fn.setter
    });
  } else {
    Object.assign(instance, { [name]: fn });
  }
}
