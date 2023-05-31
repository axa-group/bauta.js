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
    const delayToCheck = 50;
    const log = jest.fn();
    const tappedPromise = async (name: string) => {
      await delay(delayToCheck);
      return log(name);
    };
    const getMovie = step(() => ({ name: 'star wars' }));

    const pipeline = pipe(
      getMovie,
      tap(step<{ name: string }, { name: string }>(async ({ name }) => tappedPromise(name)))
    );

    const start = new Date().getTime();
    const result = await pipeline({}, createContext({}), {} as BautaJSInstance);
    // At the moment that we return from the pipeline execution, the log inside tappedPromise has not been called
    expect(log).not.toHaveBeenCalledWith('star wars');
    expect(result).toStrictEqual({ name: 'star wars' });
    expect(new Date().getTime() - start).toBeLessThan(delayToCheck);
    await delay(delayToCheck);
    // After waiting for a bit, even when the pipeline has returned the code inside the tapped promise is executed in parallel and "forgotten"
    expect(log).toHaveBeenCalledWith('star wars');
  });

  test('should ignore the error inside tap and return the previous step value', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const delayToCheck = 50;

    const tappedPromise = async (name: string) => {
      await delay(delayToCheck);

      return Promise.reject(new Error(`We have an error: ${name}`));
    };
    const getMovie = step(() => ({ name: 'star wars' }));

    const pipeline = pipe(
      getMovie,
      tap(step<{ name: string }, { name: string }>(async ({ name }) => tappedPromise(name)))
    );

    const start = new Date().getTime();
    const result = await pipeline({}, createContext({}), {} as BautaJSInstance);
    expect(result).toStrictEqual({ name: 'star wars' });
    expect(new Date().getTime() - start).toBeLessThan(delayToCheck);
  });
});
