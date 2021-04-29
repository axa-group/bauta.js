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
import httpMocks from 'node-mocks-http';
import { createContext, BautaJSInstance, GenericError } from '../../index';
import { pipe } from '../pipeline';

describe('pipe tests', () => {
  test('should throw an error on pipe 0 OperatorFunctions', () => {
    const expected = new Error('A Pipeline.StepFunction must be a function.');

    // @ts-ignore
    expect(() => pipe()).toThrow(expected);
  });

  test('should throw an error on pipe a non function', () => {
    const expected = new Error('A Pipeline.StepFunction must be a function.');

    // @ts-ignore
    expect(() => pipe('string')).toThrow(expected);
  });

  test('should be able to use previous values', async () => {
    const expected = 10;
    const pipeline = pipe(
      () => 5,
      prev => prev + 5
    );
    const ctx = createContext({});

    expect(pipeline(null, ctx, {} as BautaJSInstance)).toStrictEqual(expected);
  });

  test('should execute the pipe Pipeline.StepFunctions in order', async () => {
    const expected = 'this will be showed';
    const pipeline = pipe(
      () => 'next3',
      () => expected
    );
    const ctx = createContext({});

    expect(pipeline(null, ctx, {} as BautaJSInstance)).toStrictEqual(expected);
  });

  test('should allow pipelines on pipe method', async () => {
    const expected = 'this will be showed';
    const pipeline1 = pipe(() => expected);
    const pipeline = pipe(() => 'next3', pipeline1);
    const ctx = createContext({});

    expect(pipeline(null, ctx, {} as BautaJSInstance)).toStrictEqual(expected);
  });

  test('should allow async functions', async () => {
    const expected = 'next3';
    const pipeline = pipe(() => Promise.resolve('next3'));
    const ctx = createContext({});

    expect(await pipeline(null, ctx, {} as BautaJSInstance)).toStrictEqual(expected);
  });

  test('should execute the pipeline but go to the error handler if step is not a promise', async () => {
    const myPipeline = pipe(
      (_, ctx: any) => {
        return ctx.data.id;
      },
      value => {
        if (value === 0) {
          throw new Error('I have zeros');
        }
        return [{ id: 1, name: 'pet' }];
      }
    ).catchError((err, _, bauta) => {
      return { err, bauta };
    });

    const req = httpMocks.createRequest<any>({ id: 1, params: { id: 0 } });
    const result: any = myPipeline(
      null,
      createContext({ req, res: {}, data: { id: 0 } }),
      {} as BautaJSInstance
    );

    // We are only interested in checking that bauta indeed is accessible from the onError handler
    expect(result instanceof Promise).toBeFalsy();
    expect(result).toBeDefined();
    expect(result.err).toBeDefined();
    expect(result.bauta).toBeDefined();
  });

  test('should execute the pipeline but go to the error handler if step is a promise', async () => {
    const myPipeline = pipe(
      (_, ctx) => {
        return ctx.data.id;
      },
      async value => {
        if (value === 0) {
          throw new Error('I have zeros');
        }
        return [{ id: 1, name: 'pet' }];
      }
    ).catchError((err, _, bauta) => {
      return { err, bauta };
    });

    const req = httpMocks.createRequest<any>({ id: 1 });
    const result = (await myPipeline(
      null,
      createContext({ req, res: {}, data: { id: 0 } }),
      {} as BautaJSInstance
    )) as { err: GenericError; bauta: BautaJSInstance };
    // We are only interested in checking that bauta indeed is accessible from the onError handler
    expect(result).toBeDefined();
    expect(result.err).toBeDefined();
    expect(result.bauta).toBeDefined();
  });

  test('should execute the default error handler that by default is throw the error', async () => {
    const myPipeline = pipe(
      (_, ctx: any) => {
        return ctx.data.id;
      },
      value => {
        if (value === 0) {
          throw new Error('I have zeros');
        }
        return [{ id: 1, name: 'pet' }];
      }
    );

    const req = httpMocks.createRequest<any>({ id: 1, params: { id: 0 } });
    await expect(() =>
      myPipeline(null, createContext({ req, res: {}, data: { id: 0 } }), {} as BautaJSInstance)
    ).toThrow(expect.objectContaining({ message: 'I have zeros' }));
  });
});
