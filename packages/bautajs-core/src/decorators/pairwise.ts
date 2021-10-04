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
import { Pipeline } from '../types';
import { isPromise } from '../utils/is-promise';
/**
 * Decorator that returns the previous and current value as array
 *
 * @param {Pipeline.StepFunction<TIn, TOut>} fn - selector function to select the array to loop
 * @returns {Pipeline.StepFunction<TIn, [TIn, TOut]>}
 *
 * @example
 *
 * const { pairwise, step, pipe } =  require('@bautajs/core');
 *
 *  const getMovie = step(() => ({ name: 'star wars' }));
 *   const getMovieImdbIdAsync = step<{ name: string }, string>(() => Promise.resolve('imdb12354'));
 *
 *   const pipeline = pipe(getMovie, pairwise(getMovieImdbIdAsync), ([movie, imdbId]) => ({
 *     ...movie,
 *     imdb_id: imdbId
 *   }));
 *
 */
export function pairwise<TIn, TOut>(
  fn: Pipeline.StepFunction<TIn, TOut>
): Pipeline.StepFunction<TIn, [TIn, TOut]> {
  return (prev: TIn, ctx, bautajs) => {
    const result = fn(prev, ctx, bautajs);
    if (isPromise(result)) {
      return (result as Promise<TOut>).then((r: TOut) => [prev, r]);
    }

    return [prev, result as TOut];
  };
}
