import { BautaJSInstance, createContext, pipe, step } from '../../index.js';
import { tap } from '../tap.js';
import { jest } from '@jest/globals';

describe('tap decorator', () => {
  test('should perform the current step action but return the previous step value', async () => {
    const log = jest.fn() as any;
    const getMovie = step(() => ({ name: 'star wars' }));
    const logMovieName = step<{ name: string }, { name: string }>(({ name }) => log(name));

    const pipeline = pipe(getMovie, tap(logMovieName));

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual({
      name: 'star wars'
    });

    expect(log).toHaveBeenCalledWith('star wars');
  });

  test('should work if the step in the tap does not return anything', async () => {
    const log = jest.fn();
    const getMovie = step(() => ({ name: 'star wars' }));
    const logMovieName = step<{ name: string }, void>(({ name }) => {
      log(name);
    });

    const pipeline = pipe(getMovie, tap(logMovieName));

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual({
      name: 'star wars'
    });

    expect(log).toHaveBeenCalledWith('star wars');
  });

  test('should perform asynchronously the current step action but return the previous step value', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const log = jest.fn();
    const tappedPromise: (name: string) => Promise<any> = async (name: string) => {
      await delay(100);
      return log(name);
    };
    const getMovie = step(() => ({ name: 'star wars' }));

    const pipeline = pipe(
      getMovie,
      tap(step<{ name: string }, { name: string }>(async ({ name }) => tappedPromise(name)))
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual({
      name: 'star wars'
    });

    expect(log).toHaveBeenCalledWith('star wars');
  });

  test('should throw the error inside tap', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const tappedPromise = async (name: string) => {
      await delay(100);

      return Promise.reject(new Error(`We have an error: ${name}`));
    };
    const getMovie = step(() => ({ name: 'star wars' }));

    const pipeline = pipe(
      getMovie,
      tap(step<{ name: string }, { name: string }>(async ({ name }) => tappedPromise(name)))
    );

    await expect(() => pipeline({}, createContext({}), {} as BautaJSInstance)).rejects.toThrow(
      new Error('We have an error: star wars')
    );
  });

  test('should work if we mix multiple sync and async steps', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const log = jest.fn();
    const tappedPromise = async (name: string) => {
      await delay(100);
      return log(name);
    };

    const tappedSyncFunction = (name: string) => `${name} is a great movie!`;

    const getMovie = step(() => ({ name: 'star wars' }));

    const pipeline = pipe(
      getMovie,
      tap(
        step<{ name: string }, string>(({ name }) => name),
        tappedSyncFunction,
        tappedPromise
      )
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual({
      name: 'star wars'
    });

    expect(log).toHaveBeenCalledWith('star wars is a great movie!');
  });

  test('should work with a custom error handler', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const getMovie = step(() => ({ name: 'star wars' }));

    const log = jest.fn();

    const asyncValidationPromise = async (name: string) => {
      await delay(100);

      if (name.length > 10) {
        throw new Error(`Name ${name} is too long`);
      }
    };

    const tappedSyncFunction = (name: string) => `${name} is a great movie!`;

    const customErrorHandler = (e: Error) => {
      log(e.message);
      throw e;
    };

    const pipeline = pipe(
      getMovie,
      tap(
        step<{ name: string }, string>(({ name }) => name),
        tappedSyncFunction,
        asyncValidationPromise
      ).catchError(customErrorHandler)
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).rejects.toThrow(
      new Error('Name star wars is a great movie! is too long')
    );

    expect(log).toHaveBeenCalledWith('Name star wars is a great movie! is too long');
  });

  test('should not allow an empty custom error handler', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const getMovie = step(() => ({ name: 'star wars' }));

    const asyncValidationPromise = async (name: string) => {
      await delay(100);

      if (name.length > 10) {
        throw new Error(`Name ${name} is too long`);
      }
    };

    const tappedSyncFunction = (name: string) => `${name} is a great movie!`;

    const customErrorHandler = undefined;

    expect(() =>
      pipe(
        getMovie,
        tap(
          step<{ name: string }, string>(({ name }) => name),
          tappedSyncFunction,
          asyncValidationPromise
        ).catchError(customErrorHandler as any)
      )
    ).toThrow(new Error('Tap catchError function must be called with a function or a promise.'));
  });

  test('should return previous value when the custom error handler does not throw an error', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const getMovie = step(() => ({ name: 'star wars' }));

    const log = jest.fn();

    const asyncValidationPromise = async (name: string) => {
      await delay(100);

      if (name.length > 10) {
        throw new Error(`Name ${name} is too long`);
      }
    };

    const tappedSyncFunction = (name: string) => `${name} is a great movie!`;

    const customErrorHandler = (e: Error) => {
      log(e.message);
      return 'there is an error but we have decided to ignore it!';
    };

    const pipeline = pipe(
      getMovie,
      tap(
        step<{ name: string }, string>(({ name }) => name),
        tappedSyncFunction,
        asyncValidationPromise
      ).catchError(customErrorHandler)
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual({
      name: 'star wars'
    });

    expect(log).toHaveBeenCalledWith('Name star wars is a great movie! is too long');
  });
});
