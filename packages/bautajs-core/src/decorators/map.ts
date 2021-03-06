import { BautaJSInstance, Context } from '../types';
/**
 * Decorator that allows to loop over the given selected array and map each item.
 *
 * @param {(prev: TIn, ctx: Context, batuaJS: BautaJSInstance) => TIn1[]} selector - selector function to select the array to loop
 * @param {(value: TIn1, ctx: Context, batuaJS: BautaJSInstance) => TOut} mapFn - map function to be applied to all array items. The map function can not be async if you need to use async use parallelMap decorator.
 * @returns {Pipeline.StepFunction<TIn, TOut[]>}
 *
 * @example
 *
 * const { map, pipe, step } =  require('@axa/bautajs-core');
 *
 * const getMovies = step(() => [{name: 'star wars'},{ name: 'petter' }]);
 * const addGenresNamesToMovie = step((movie) => ({...movie, genre:'action'}));
 * const addTmdbIdToMovie = step((movie) => ({...movie, tmdbId:'1234'}));

 *  const pipeline = pipe(
 *    getMovies,
 *    map((movies) => movies, pipe(addGenresNamesToMovie, addTmdbIdToMovie))
 *  );
 *
 */
export function map<TIn, TIn1, TOut>(
  selector: (prev: TIn, ctx: Context, batuaJS: BautaJSInstance) => TIn1[],
  mapFn: (value: TIn1, ctx: Context, batuaJS: BautaJSInstance) => TOut
): (value: TIn, ctx: Context, batuaJS: BautaJSInstance) => TOut[] {
  return (prev, ctx, bautajs) => {
    const array = selector(prev, ctx, bautajs);
    if (!Array.isArray(array)) {
      throw new Error(`Selector function must be an array type, instead found: ${typeof array}`);
    }

    return array.map(item => mapFn(item, ctx, bautajs));
  };
}
