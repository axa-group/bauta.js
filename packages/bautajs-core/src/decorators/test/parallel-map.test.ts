import { BautaJSInstance, createContext, pipe, step } from '../../index.js';
import { parallelMap } from '../parallel-map.js';

describe('parallel map decorator', () => {
  test('should throw an error if the selector do not return an array', async () => {
    const getMovies = step(() => 1);
    const addGenresNamesToMovie = step((movie: any) =>
      Promise.resolve({ ...movie, genre: 'action' })
    );
    const addTmdbIdToMovie = step((movie: any) => ({ ...movie, tmdbId: '1234' }));

    const pipeline = pipe(
      getMovies,
      parallelMap(movies => movies as any, pipe(addGenresNamesToMovie, addTmdbIdToMovie))
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).rejects.toThrow(
      new Error('Selector function must be an array type, instead found: number')
    );
  });

  test('should execute the given async pipeline for each array item', async () => {
    const getMovies = step(() => [{ name: 'star wars' }, { name: 'petter' }]);
    const addGenresNamesToMovie = step((movie: any) =>
      Promise.resolve({ ...movie, genre: 'action' })
    );
    const addTmdbIdToMovie = step((movie: any) => ({ ...movie, tmdbId: '1234' }));

    const pipeline = pipe(
      getMovies,
      parallelMap(movies => movies, pipe(addGenresNamesToMovie, addTmdbIdToMovie))
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual([
      { name: 'star wars', genre: 'action', tmdbId: '1234' },
      { name: 'petter', genre: 'action', tmdbId: '1234' }
    ]);
  });
});
