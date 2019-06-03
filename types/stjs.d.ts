declare module 'stjs' {
  export interface Root<T> {
    root: () => T;
  }

  export interface TransformWith<T> {
    transformWith<T>(template: T): Root<T>;
  }
  export function select<T>(options: object): TransformWith<T>;
}
