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
import { BautaJSInstance, Context, OperatorFunction, Logger, DefaultLogger } from '@bautajs/core';
import fastSafeStringify from 'fast-safe-stringify';
import moize from 'moize';

const defaultLogger = new DefaultLogger('bautajs-decorator-cache');

export type Normalizer<TIn> = (value: [TIn, Context, BautaJSInstance]) => any;

/**
@export
 * @template TIn
 * @param {OperatorFunction<TIn, TOut>} fn lalala25
 * @param {Normalizer<TIn>} normalizer
 * @param {memoizee.Options} [options={}]
 * @returns {OperatorFunction<TIn, any>}
 * @example
 */
export interface CacheDecorator {
  <TIn, TOut>(
    fn: OperatorFunction<TIn, TOut>,
    normalizer: Normalizer<TIn>,
    options?: moize.Options,
    logger?: Logger
  ): OperatorFunction<TIn, TOut>;
}

const generateMatchingKeyFunction = <TIn>(normalizer: Normalizer<TIn>): any => {
  return (
    [object1, context1, bautajs1]: [TIn, Context, BautaJSInstance],
    [object2, context2, bautajs2]: [TIn, Context, BautaJSInstance]
  ) => {
    return normalizer([object1, context1, bautajs1]) === normalizer([object2, context2, bautajs2]);
  };
};

const configureCache = <TIn, TOut>(
  fn: OperatorFunction<TIn, TOut>,
  normalizer: Normalizer<TIn>,
  options?: moize.Options,
  inputLogger?: Logger
): any => {
  const logger = inputLogger || defaultLogger;
  const matchesKey = generateMatchingKeyFunction(normalizer);
  const getKeysFromCache = (cache: moize.Cache) => {
    return cache.keys.map(key => normalizer(key as [TIn, Context, BautaJSInstance]));
  };

  const cacheOptions = {
    maxSize: 25, // defaults to 1, which is small for most use cases
    ...options,
    // isMatchingKey,
    matchesKey,
    onCacheAdd(cache: moize.Cache) {
      logger.debug(
        `Cache added key ${normalizer(
          cache.keys[0] as [TIn, Context, BautaJSInstance]
        )} value ${fastSafeStringify(cache.values[0])} size ${cache.values.length}`
      );
    },
    onCacheHit(cache: moize.Cache) {
      logger.info(
        `Cache hit in cache with keys ${getKeysFromCache(cache)} values ${fastSafeStringify(
          cache.values
        )}`
      );
    }
  };

  logger.debug(
    `Cache configured with options ${fastSafeStringify(
      cacheOptions
    )} and normalizer ${normalizer.toString()}`
  );

  const cache = moize(fn, cacheOptions);

  return cache;
};

/**
 * Cache the given OperatorFunctions with [memoizee](https://www.npmjs.com/package/memoizee)
 * @export
 * @template TIn
 * @param {OperatorFunction<TIn, TOut>} fn The operatorFunction whose result will be cached
 * @param {Normalizer<TIn>} normalizer normalizer function whose result is used as key to determine if the value will be cached or not. This function must be synchronous.
 * @param {MicroMemoize.Options} [options={}] options. onCacheAdd,onCacheHit and isMatchingKey options are used internally by bauta cache
 * @param {Logger} logger optional logger to be used to log cache statistics
 * and will be ignored
 * @returns {OperatorFunction<TIn, any>}
 * @example
 * const { cache } = require('@batuajs/cache-decorator');
 *
 * operations.v1.op1.setup(p => p.push(cache([() => {...}], ([_,ctx] => ctx.data.token))))
 */
// eslint-disable-next-line import/export
export const cache: CacheDecorator = <TIn, TOut>(
  fn: OperatorFunction<TIn, TOut>,
  normalizer: Normalizer<TIn>,
  options?: moize.Options,
  logger?: Logger
): OperatorFunction<TIn, TOut> => {
  if (!normalizer) {
    throw new Error(
      'normalizer: ([prev, ctx, bautajs])=>{ //return key;} function is a mandatory parameter to calculate the cache key'
    );
  }
  const cached = configureCache<TIn, TOut>(fn, normalizer, options, logger);

  return async <TIn, TOut>(value: TIn, ctx: Context, bautajs: BautaJSInstance) =>
    cached(value, ctx, bautajs) as TOut;
};

export default cache;
