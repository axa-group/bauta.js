import { BautaJSInstance, Context, Pipeline } from '@axa/bautajs-core';
import QuickLRU, { Options } from 'quick-lru-cjs';
import nodeObjectHash from 'node-object-hash';
import { Normalizer, CacheStepFunction } from './types';

const objectHash = nodeObjectHash({
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
 * @param {Pipeline.StepFunction<TIn, TOut>} pipeline
 * @param {Normalizer<TIn, CacheKey>} [normalizer=(prev: TIn) => hash(prev)]
 * @param {Options} options
 * @param {Number} [options.maxAge=0] Milliseconds an item will remain in cache; lazy expiration upon next get() of an item. With 0 items never expires.
 * @param {Number} options.maxSize=500 Max number of items on cache.
 * @return {CacheDecoratorFunction<TIn, TOut>} An operation function that you can plug in on a `bautajs` pipeline.
 * @example
 * import { pipe, createContext } from '@axa/bautajs-core';
 * import { cache } from '@axa/bautajs-decorator-cache';
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
 * const myPipeline = pipe(
 *  createAKey,
 *  doSomethingHeavy
 * );
 *
 * const cacheMyPipeline = cache(myPipeline, (prev, ctx) => ctx.data.myKey, { maxSize:3 });
 *
 * const result = await cacheMyPipeline(null, createContext({}));
 * console.log(result);
 */
export function cache<TIn, TOut, CacheKey = string>(
  fn: Pipeline.StepFunction<TIn, TOut>,
  options: Options<CacheKey, TOut>,
  normalizer: Normalizer<TIn, CacheKey> = (prev: TIn): CacheKey => objectHash.hash(prev) as any
): CacheStepFunction<TIn, TOut, CacheKey> {
  const store = new QuickLRU<CacheKey, TOut>(options);

  const stepFunction: Pipeline.StepFunction<TIn, TOut> = (
    prev: TIn,
    ctx: Context,
    bautajs: BautaJSInstance
  ): TOut | Promise<TOut> => {
    const key = normalizer(prev, ctx, bautajs);
    if (store.has(key)) {
      ctx.log.debug(`Cache hit in cache with key ${key}.`);
      return store.get(key) as TOut;
    }
    const value = fn(prev, ctx, bautajs);
    if (value instanceof Promise) {
      return value.then(val => {
        store.set(key, val);
        ctx.log.debug(`Cache added key ${key}.`);
        return val;
      });
    }

    store.set(key, value as TOut);
    ctx.log.debug(`Cache added key ${key}.`);
    return value as TOut;
  };

  return Object.defineProperty(stepFunction, 'store', {
    value: store,
    enumerable: false,
    configurable: false,
    writable: false
  }) as CacheStepFunction<TIn, TOut, CacheKey>;
}

export default cache;
export * from './types';
