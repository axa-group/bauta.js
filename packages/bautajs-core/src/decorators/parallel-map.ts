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
import { BautaJSInstance, Context, Pipeline } from '../types';
import { map } from './map';

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
      )(prev, ctx, bautajs) as TOut[]
    );
  };
}
