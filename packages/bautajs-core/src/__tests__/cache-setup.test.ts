import { createContext } from '../utils/create-context';
import { pipe } from '../index';
import { cache } from '../decorators/cache';
import { BautaJSInstance } from '../types';
import { sleep } from './utils';

describe('cache setup', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  test('should create a default cache without ttl', async () => {
    const pp = pipe(
      () => [{ a: '123' }],
      (result: any) => ({ ...result[0], new: 1 })
    );
    const myCachePipeline = cache(pp, { maxSize: 4 }, (_, ctx) => ctx.id || 'someId');

    await myCachePipeline(null, createContext({}), {} as BautaJSInstance);

    expect(myCachePipeline.store.size).toBe(1);
  });

  test('should create a cache with ttl if maxAge is passed', async () => {
    const pp = pipe(
      () => [{ a: '123' }],
      (result: any) => ({ ...result[0], new: 1 })
    );
    const myCachePipeline = cache(pp, { maxSize: 10, maxAge: 200 }, (_, ctx) => ctx.id || 'someId');

    await myCachePipeline(null, createContext({ id: 'test' }), {} as BautaJSInstance);
    expect(myCachePipeline.store.get('test')).toStrictEqual({
      a: '123',
      new: 1
    });
    await sleep(300);
    expect(myCachePipeline.store.get('test')).toBeUndefined();
  });
});
