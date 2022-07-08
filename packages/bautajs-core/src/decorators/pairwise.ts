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
 * const { pairwise, step, pipe } =  require('@axa/bautajs-core');
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
