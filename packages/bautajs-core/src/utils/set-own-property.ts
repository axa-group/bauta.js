export function setOwnProperty<T extends object, TValue>(
  target: T,
  key: string | symbol,
  value: TValue
): TValue {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });

  return value;
}

export default setOwnProperty;
