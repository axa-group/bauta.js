import { pipe } from '../pipeline';
import { createContext } from '../../utils/create-context';
import { BautaJSInstance } from '../../types';

describe('catchError operator tests', () => {
  test('should set the given error handler', () => {
    const errorHandler = () => {
      throw new Error('error');
    };
    const ctx = createContext({});
    const expected = new Error('error');
    const pipeline = pipe(() => {
      throw new Error('crashhh!!!');
    }).catchError(errorHandler);

    expect(() => pipeline(null, ctx, {} as BautaJSInstance)).toThrow(expected);
  });

  test('should be called only onces', async () => {
    const errorHandler = jest.fn().mockImplementation(() => Promise.reject(new Error('error')));
    const stepFunction1 = () => 'bender';
    const stepFunction2 = () => 'bender3';
    const stepFunction3 = () => {
      throw new Error('crashhh!!!');
    };
    const stepFunction4 = () => 'bender4';
    const pipeline = pipe(stepFunction1, stepFunction2, stepFunction3, stepFunction4).catchError(
      errorHandler
    );
    const ctx = createContext({});

    await expect(pipeline(null, ctx, {} as BautaJSInstance)).rejects.toThrow(new Error('error'));

    expect(errorHandler.mock.calls).toHaveLength(1);
  });

  test('should catch the error for nested pipelines', () => {
    const expected = new Error('error');
    const errorHandler = () => {
      throw expected;
    };
    const ctx = createContext({});
    const pipelineNested = pipe(() => {
      throw new Error('crashhh!!!');
    });
    const pipeline = pipe(() => {
      return 'ok';
    }, pipelineNested).catchError(errorHandler);

    expect(() => pipeline(null, ctx, {} as BautaJSInstance)).toThrow(expected);
  });

  test('should allow multiple catchError in different pipelines', async () => {
    const errorHandler1 = () => {
      return 'is OK';
    };
    const errorHandler = () => Promise.reject(new Error('error'));
    const stepFunction1 = () => 'bender';
    const stepFunction2 = () => 'bender3';
    const stepFunction3 = () => {
      throw new Error('crashhh!!!');
    };
    const stepFunction4 = () => 'bender4';
    const pipeline1 = pipe(stepFunction1, stepFunction2).catchError(errorHandler1);
    const pipeline = pipe(pipeline1, stepFunction3, stepFunction4).catchError(errorHandler);
    const ctx = createContext({});

    await expect(pipeline(null, ctx, {} as BautaJSInstance)).rejects.toThrow(new Error('error'));
  });

  test('last error handler should override all the others', async () => {
    const errorHandler1 = () => {
      Promise.reject(new Error('error1'));
    };
    const errorHandler = () => Promise.reject(new Error('last Error handler'));
    const stepFunction1 = () => 'bender';
    const stepFunction2 = () => 'bender3';
    const stepFunction3 = () => {
      throw new Error('crashhh!!!');
    };
    const stepFunction4 = () => 'bender4';
    const pipeline1 = pipe(stepFunction1, stepFunction2).catchError(errorHandler1);
    const pipeline = pipe(pipeline1, stepFunction3, stepFunction4).catchError(errorHandler);
    const ctx = createContext({});

    await expect(pipeline(null, ctx, {} as BautaJSInstance)).rejects.toThrow(
      new Error('last Error handler')
    );
  });
});
