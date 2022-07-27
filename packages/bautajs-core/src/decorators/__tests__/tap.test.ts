import { BautaJSInstance, createContext, pipe, step } from '../..';
import { tap } from '../tap';

describe('tap decorator', () => {
  test('should perform the current step action but return the previous step value', async () => {
    const log = jest.fn();
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
    const tappedPromise = async (name: string) => {
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

  test('should ignore the error inside tap and return the previous step value', async () => {
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

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual({
      name: 'star wars'
    });
  });
});
