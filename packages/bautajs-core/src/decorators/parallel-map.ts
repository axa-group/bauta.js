import { BautaJSInstance, Context, Pipeline } from '../types.js';
import { map } from './map.js';

/**
 * Loop over the selected array and create a promise for each array item with the given mapFn, then it will resolve everything in parallel.
 * @template TIn
 * @template TOut
 * @param {...functions: Pipeline.StepFunction<TIn, any>[]} functions
 * @returns {Pipeline.StepFunction<TIn, any[]>}
 * @example
 *
 * const { parallelMap, pipe } = require('@batuajs/core');
 * const { getMovieImdbId } = require('./my-datasource');
 *
 * operations.op1.setup(pipe(
 *  parallelMap(
 *   movies => movies,
 *   getMovieImdbId()
 *  ),
 *  movies => movies.filter(m => !!m.imdb_id)
 * );
 */
export function parallelMap<TIn, TIn1, TOut>(
  selector: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => TIn1[],
  mapFn: Pipeline.StepFunction<TIn1, TOut>
): Pipeline.StepFunction<TIn, TOut[]> {
  return async function parallelPiped(prev: TIn, ctx, bautajs): Promise<TOut[]> {
    return Promise.all(
      map<TIn, TIn1, TOut>(
        selector,
        mapFn as (prev: TIn1, ctx: Context, bautajs: BautaJSInstance) => TOut
      )(prev, ctx, bautajs)
    );
  };
}
