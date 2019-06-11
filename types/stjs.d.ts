declare module 'stjs' {
  export interface Root<T> {
    root: () => T;
  }

  export interface Selection<T> {
    transformWith<T>(template: T): Root<T>;
    transform<T>(data: object): Root<T>;
    values(): string[];
  }
  export function select<T>(data: object | T, filter?: any): Selection<T>;
}
