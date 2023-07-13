import { BautaJSInstance, createContext, pipe } from '../../index';
import { asPromise } from '../as-promise';

describe('callback decorator', () => {
  test('should execute as a callback', async () => {
    const pipeline = pipe(
      asPromise((_: any, ctx: any, _bautajs: any, done: any) =>
        done(null, [{ id: ctx.data.id, name: 'pet' }])
      )
    );

    await expect(
      pipeline({}, createContext({ data: { id: 1 } }), {} as BautaJSInstance)
    ).resolves.toStrictEqual([{ id: 1, name: 'pet' }]);
  });
});
