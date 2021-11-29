export function isPromise(obj: any): boolean {
  return typeof obj?.then === 'function';
}
