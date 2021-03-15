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

import { BautaJSInstance, Context, OperatorFunction } from '@bautajs/core';
import QuickLRU, { Options } from 'quick-lru-cjs';
import nodeObjectHash from 'node-object-hash';
import { Normalizer, CacheOperatorFunction } from './types';

const { hash } = nodeObjectHash({
  // We don't care about the order of an object properties this could add some overhead over the performance.
  sort: false,
  // Set and array will generate same hashes and different symbol will generate different hashes in order to improve performance.
  coerce: { set: true, symbol: false }
});
/**
 * Cache the given OperationFunction or pipeline.
 * If maxAge is provided the module tinyLRU will be used to allow the items to expired.
 * If only maxSize or non option is provided the module hashlru will be used to improve the speed.
 * @export
 * @template TIn
 * @template TOut
 * @template CacheKey
 * @param {OperatorFunction<TIn, TOut>} pipeline
 * @param {Normalizer<TIn, CacheKey>} [normalizer=(prev: TIn) => hash(prev)]
 * @param {Options} options
 * @param {Number} [options.maxAge=0] Milliseconds an item will remain in cache; lazy expiration upon next get() of an item. With 0 items never expires.
 * @param {Number} options.maxSize=500 Max number of items on cache.
 * @return {CacheOperatorFunction<TIn, TOut>} An operation function that you can plug in on a `bautajs` pipeline.
 * @example
 * import { pipelineBuilder, createContext } from '@bautajs/core';
 * import { cache } from '@bautajs/decorator-cache';
 *
 * function createAKey(prev, ctx, bautajs) {
 *  ctx.data.myKey = 'mykey';
 * }
 *
 * function doSomethingHeavy(prev, ctx, bautajs) {
 *  let acc = 0;
 *  for(let i=0; i < 1000000000; i++) {
 *    acc += i;
 *  }
 *
 *  return acc;
 * }
 *
 * const myPipeline = pipelineBuilder(p => p.pipe(
 *  createAKey,
 *  doSomethingHeavy
 * ));
 *
 * const cacheMyPipeline = cache(myPipeline, (prev, ctx) => ctx.data.myKey, { maxSize:3 });
 *
 * const result = await cacheMyPipeline(null, createContext({req:{}}), {});
 * console.log(result);
 */
export function cache<TIn, TOut, CacheKey extends string>(
  fn: OperatorFunction<TIn, TOut>,
  normalizer: Normalizer<TIn, CacheKey> = (prev: TIn): CacheKey => hash(prev) as CacheKey,
  options: Options<CacheKey, TOut>
): CacheOperatorFunction<TIn, TOut, CacheKey> {
  const store = new QuickLRU<CacheKey, TOut>(options);

  const operatorFunction: OperatorFunction<TIn, TOut> = async (
    prev: TIn,
    ctx: Context,
    bautajs: BautaJSInstance
  ): Promise<TOut> => {
    const key = normalizer(prev, ctx, bautajs);
    if (store.has(key)) {
      ctx.logger.debug(`Cache hit in cache with key ${key}.`);
      return store.get(key) as TOut;
    }
    const value = await fn(prev, ctx, bautajs);
    store.set(key, value);
    ctx.logger.debug(`Cache added key ${key}.`);
    return value;
  };

  return Object.assign(operatorFunction, { store });
}

export default cache;
export * from './types';
