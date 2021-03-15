import { BautaJSInstance, Context, OperatorFunction } from '@bautajs/core';
import QuickLRU from 'quick-lru';

export interface Normalizer<TIn, CacheKey> {
  (prev: TIn, ctx: Context, bautajs: BautaJSInstance): CacheKey;
}

export interface CacheOperatorFunction<TIn, TOut, CacheKey> extends OperatorFunction<TIn, TOut> {
  store: QuickLRU<CacheKey, TOut>;
}
