import { pipe } from '../src/index';
import { createContext } from '../src/utils/create-context';
import { cache, CacheStepFunction, Normalizer } from '../src/decorators/cache';
import { BautaJSInstance } from '../src/types';
import { sleep } from './utils';
import { jest } from '@jest/globals';

describe('cache decorator usage', () => {
  let myCachePipeline: CacheStepFunction<any, any, any>;

  describe('normalizer using context req param', () => {
    beforeEach(async () => {
      const normalizer: Normalizer<any, any> = (_, ctx) => ctx.data.value;

      const pp = pipe(
        (_, ctx) => {
          return ctx.data.value;
        },
        value => ({ a: '123', b: value }),
        result => ({ ...result, new: 1 })
      );
      myCachePipeline = cache(pp, { maxSize: 5 }, normalizer);
    });

    afterEach(() => {
      myCachePipeline.store.clear();
    });

    test('should be called with one add cache hit for first value', () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      myCachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      myCachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      expect(myCachePipeline.store.get('144')).toStrictEqual({ a: '123', b: '144', new: 1 });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('should save more than one cache item if the key (req.param) is different', () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      myCachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      myCachePipeline(
        null,
        createContext({
          data: { value: '200' }
        }),
        {} as BautaJSInstance
      );

      expect(myCachePipeline.store.get('144')).toStrictEqual({ a: '123', b: '144', new: 1 });
      expect(myCachePipeline.store.get('200')).toStrictEqual({ a: '123', b: '200', new: 1 });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    test('user should be able to clear the cache', () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      myCachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      myCachePipeline.store.clear();

      expect(myCachePipeline.store.size).toBe(0);

      myCachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      expect(myCachePipeline.store.get('144')).toStrictEqual({ a: '123', b: '144', new: 1 });
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache with maxAge expiration', () => {
    let addNew: any;
    let cachePipeline: CacheStepFunction<any, any, any>;
    beforeEach(() => {
      addNew = jest.fn(result => ({ ...result, new: 1 }));
      const normalizer: Normalizer<any, any> = (_, ctx) => ctx.data.value;

      const pp = pipe(
        (_, ctx) => {
          return ctx.data.value;
        },
        value => ({ a: '123', b: value }),
        addNew
      );

      cachePipeline = cache(pp, { maxSize: 5, maxAge: 20 }, <any>normalizer);
    });

    afterEach(() => {
      cachePipeline.store.clear();
      addNew.mockClear();
    });

    test('it should not have the cached element after the maxAge', async () => {
      cachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      // It waits more than the maxAge time before verifying the cache has been flushed
      await sleep(500);
      expect(cachePipeline.store.get('144')).toBeUndefined();

      // Calling again the pipeline to verify that addNew step has been called again due to the cache is not active
      cachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );
      expect(addNew).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache with only 1 slot', () => {
    beforeEach(async () => {
      const normalizer: Normalizer<any, any> = (_, ctx) => ctx.data.value;

      const pp = pipe(
        (_, ctx) => {
          return ctx.data.value;
        },
        value => ({ a: '123', b: value }),
        result => ({ ...result, new: 1 })
      );
      myCachePipeline = cache(pp, { maxSize: 1 }, <any>normalizer);
    });

    afterEach(() => {
      myCachePipeline.store.clear();
    });

    test('cache max size should be respected', () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      myCachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      myCachePipeline(
        null,
        createContext({
          data: { value: '244' }
        }),
        {} as BautaJSInstance
      );

      myCachePipeline(
        null,
        createContext({
          data: { value: '144' }
        }),
        {} as BautaJSInstance
      );

      expect(myCachePipeline.store.get('144')).toStrictEqual({ a: '123', b: '144', new: 1 });
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });
});
