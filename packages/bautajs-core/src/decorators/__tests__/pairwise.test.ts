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
import { pairwise } from '../pairwise';

describe('pairwise decorator', () => {
  test('should merge the previous and actual value and return an array in next step if actual is a promise', async () => {
    const getMovie = step(() => ({ name: 'star wars' }));
    const getMovieImdbIdAsync = step<{ name: string }, string>(() => Promise.resolve('imdb12354'));

    const pipeline = pipe(getMovie, pairwise(getMovieImdbIdAsync), ([movie, imdbId]) => ({
      ...movie,
      imdb_id: imdbId
    }));

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual({
      name: 'star wars',
      imdb_id: 'imdb12354'
    });
  });

  test('should merge the previous and actual value and return an array in next step if actual is a value', () => {
    const getMovie = step(() => ({ name: 'star wars' }));
    const getMovieImdbId = step<{ name: string }, string>(() => 'imdb12354');

    const pipeline = pipe(getMovie, pairwise(getMovieImdbId), ([movie, imdbId]) => ({
      ...movie,
      imdb_id: imdbId
    }));

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual({
      name: 'star wars',
      imdb_id: 'imdb12354'
    });
  });

  test('should propagate the thrown errors inside a pairwise', () => {
    const getMovie = step(() => ({ name: 'star wars' }));
    const stepWhichThrown = step<{ name: string }, string>(() => {
      throw new Error('some error happens');
    });

    const pipeline = pipe(getMovie, pairwise(stepWhichThrown), ([movie, imdbId]) => ({
      ...movie,
      imdb_id: imdbId
    }));

    expect(() => pipeline({}, createContext({}), {} as BautaJSInstance)).toThrow(
      expect.objectContaining({
        message: 'some error happens'
      })
    );
  });
});
