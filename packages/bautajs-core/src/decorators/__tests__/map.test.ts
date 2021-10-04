/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BautaJSInstance, createContext, pipe, step } from '../..';
import { map } from '../map';

describe('map decorator', () => {
  test('should throw an error if the selector do not return an array', async () => {
    const getMovies = step(() => 1);
    const addGenresNamesToMovie = step((movie: any) => ({ ...movie, genre: 'action' }));
    const addTmdbIdToMovie = step((movie: any) => ({ ...movie, tmdbId: '1234' }));

    const pipeline = pipe(
      getMovies,
      map(movies => movies as any, pipe(addGenresNamesToMovie, addTmdbIdToMovie))
    );

    expect(() => pipeline({}, createContext({}), {} as BautaJSInstance)).toThrow(
      new Error('Selector function must be an array type, instead found: number')
    );
  });

  test('should execute the given pipeline for each array item', async () => {
    const getMovies = step(() => [{ name: 'star wars' }, { name: 'petter' }]);
    const addGenresNamesToMovie = step((movie: any) => ({ ...movie, genre: 'action' }));
    const addTmdbIdToMovie = step((movie: any) => ({ ...movie, tmdbId: '1234' }));

    const pipeline = pipe(
      getMovies,
      map(movies => movies, pipe(addGenresNamesToMovie, addTmdbIdToMovie))
    );

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual([
      { name: 'star wars', genre: 'action', tmdbId: '1234' },
      { name: 'petter', genre: 'action', tmdbId: '1234' }
    ]);
  });

  test('should not resolve the promises if one of the pipeline steps is async', async () => {
    const getMovies = step(() => [{ name: 'star wars' }, { name: 'petter' }]);
    const addGenresNamesToMovie = step((movie: any) =>
      Promise.resolve({ ...movie, genre: 'action' })
    );
    const addTmdbIdToMovie = step((movie: any) => ({ ...movie, tmdbId: '1234' }));

    const pipeline = pipe(
      getMovies,
      map(movies => movies, pipe(addGenresNamesToMovie, addTmdbIdToMovie))
    );

    const result = pipeline({}, createContext({}), {} as BautaJSInstance) as any[];

    expect.assertions(2);

    result.forEach(r => {
      expect(r instanceof Promise).toBeTruthy();
    });
  });
});
