import { BautaJSInstance, Context, Pipeline } from '@axa/bautajs-core';
import QuickLRU from 'quick-lru';

export interface Normalizer<TIn, CacheKey> {
  (prev: TIn, ctx: Context, bautajs: BautaJSInstance): CacheKey;
}

export interface CacheStepFunction<TIn, TOut, CacheKey> extends Pipeline.StepFunction<TIn, TOut> {
  store: QuickLRU<CacheKey, TOut>;
}
