import { BautaJSInstance, createContext, pipe } from '../../index.js';
import { parallel } from '../parallel.js';

describe('parallel decorator', () => {
  test('should execute the promises in parallel', async () => {
    const pipeline = pipe(
      parallel(
        () => Promise.resolve({ id: 3, name: 'pet3' }),
        () => Promise.resolve({ id: 1, name: 'pet' })
      )
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual([
      { id: 3, name: 'pet3' },
      { id: 1, name: 'pet' }
    ]);
  });
});
