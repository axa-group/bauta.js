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
});
