import httpMocks from 'node-mocks-http';
import { createContext, BautaJSInstance, GenericError } from '../../index';
import { pipe } from '../pipeline';

describe('pipe tests', () => {
  test('should throw an error on pipe 0 StepFunctions', () => {
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

  test('should allow for up to 16 steps in a pipeline', async () => {
    const expected = "Let's sing: LA LA LA LA LA LA LA LA LA LA LA LA LA LA LA ";
    const firstValue = 'LA ';
    const myStep = (prev: string) => `${prev}${firstValue}`;

    const pipeline = pipe(
      () => "Let's sing: ",
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep,
      myStep
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

    await expect(pipeline(null, ctx, {} as BautaJSInstance)).resolves.toStrictEqual(expected);
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

  test('should throw an pipeline cancellation error if request was canceled before the async fn is resolved and not execute further step functions', async () => {
    const step1 = jest.fn();
    const step2 = jest.fn(() => new Promise(resolve => setTimeout(() => resolve(true), 300)));
    const step3 = jest.fn();
    const pipeline = pipe(step1, step2, step3);
    const ctx = createContext({});

    const result = pipeline(null, ctx, {} as BautaJSInstance);
    ctx.token.cancel();
    await expect(result).rejects.toThrow(
      new Error('Pipeline canceled due to a request cancellation.')
    );

    expect(step3).toHaveBeenCalledTimes(0);
  });

  test('should throw an pipeline cancellation error if request was canceled on a sync environment fn is resolved and not execute further step functions', () => {
    const step1 = jest.fn();
    const step2 = jest.fn((_, ctx) => {
      ctx.token.cancel();
    });
    const step3 = jest.fn();
    const pipeline = pipe(step1, step2, step3);
    const ctx = createContext({});

    expect(() => pipeline(null, ctx, {} as BautaJSInstance)).toThrow(
      new Error('Pipeline canceled due to a request cancellation.')
    );

    expect(step3).toHaveBeenCalledTimes(0);
  });

  test('should only execute the onCanceled of the executed steps', async () => {
    const onCanceled1 = jest.fn();
    const onCanceled2 = jest.fn();
    const onCanceled3 = jest.fn();
    const pipeline = pipe(
      (_, ctx) => {
        ctx.token.onCancel(onCanceled1);
      },
      (_, ctx) => {
        ctx.token.onCancel(onCanceled2);
        ctx.token.cancel();
      },
      (_, ctx) => {
        ctx.token.onCancel(onCanceled3);
      }
    );
    const ctx = createContext({});

    expect(() => pipeline(null, ctx, {} as BautaJSInstance)).toThrow(
      new Error('Pipeline canceled due to a request cancellation.')
    );

    expect(onCanceled3).toHaveBeenCalledTimes(0);
    expect(onCanceled2).toHaveBeenCalledTimes(1);
    expect(onCanceled1).toHaveBeenCalledTimes(1);
  });
});
