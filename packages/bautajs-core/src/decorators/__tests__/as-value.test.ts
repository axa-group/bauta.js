import { BautaJSInstance, createContext, pipe } from '../../index';
import { asValue } from '../as-value';

describe('as value decorator', () => {
  test('should allow send a simple value', async () => {
    const pipeline = pipe(asValue([{ id: 1, name: 'pet' }]));

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual([
      { id: 1, name: 'pet' }
    ]);
  });
});
