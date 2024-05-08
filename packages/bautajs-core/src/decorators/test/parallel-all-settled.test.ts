import { BautaJSInstance, createContext, pipe } from '../../index.js';
import { parallelAllSettled } from '../parallel-all-settled.js';

describe('parallel-all-settled decorator', () => {
  test('should execute the promises in parallel and return array of objects containing status and value for resolved, and reason and status for rejected', async () => {
    const error = new Error('no pets here!');

    const pipeline = pipe(
      parallelAllSettled(
        () => Promise.resolve({ id: 1, name: 'pet1' }),
        () => Promise.resolve({ id: 2, name: 'pet2' }),
        () => Promise.resolve({ id: 3, name: 'pet3' }),
        () => Promise.reject(error)
      )
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual([
      { status: 'fulfilled', value: { id: 1, name: 'pet1' } },
      { status: 'fulfilled', value: { id: 2, name: 'pet2' } },
      { status: 'fulfilled', value: { id: 3, name: 'pet3' } },
      { reason: error, status: 'rejected' }
    ]);
  });
});
