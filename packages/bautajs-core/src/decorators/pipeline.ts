import { BautaJSInstance, Context, GenericError, Pipeline } from '../types';
import { isPromise } from '../utils/is-promise';

export function compose<T, R>(
  f1: Pipeline.StepFunction<T, R>,
  f2: Pipeline.StepFunction<T, R>
): Pipeline.StepFunction<T, R> {
  return (prev: T, ctx: Context, bautajs: BautaJSInstance) => {
    const res = f1(prev, ctx, bautajs);

    if (isPromise(res)) {
      return (res as Promise<R>).then((r: any) => {
        if (ctx.token.isCanceled === true) {
          throw new Error('Pipeline canceled due to a request cancellation.');
        }
        return f2(r, ctx, bautajs);
      });
    }

    if (ctx.token.isCanceled === true) {
      throw new Error('Pipeline canceled due to a request cancellation.');
    }

    return f2(res as any, ctx, bautajs);
  };
}

export function pipe<ValueType, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<ValueType, ResultValue1, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<ValueType, ResultValue1, ResultValue2, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<ValueType, ResultValue1, ResultValue2, ResultValue3, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<ValueType, ResultValue1, ResultValue2, ResultValue3, ResultValue4, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ResultValue10,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ResultValue10>,
  f11: Pipeline.StepFunction<ResultValue10, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ResultValue10,
  ResultValue11,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ResultValue10>,
  f11: Pipeline.StepFunction<ResultValue10, ResultValue11>,
  f12: Pipeline.StepFunction<ResultValue11, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ResultValue10,
  ResultValue11,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ResultValue10>,
  f11: Pipeline.StepFunction<ResultValue10, ResultValue11>,
  f12: Pipeline.StepFunction<ResultValue11, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ResultValue10,
  ResultValue11,
  ResultValue12,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ResultValue10>,
  f11: Pipeline.StepFunction<ResultValue10, ResultValue11>,
  f12: Pipeline.StepFunction<ResultValue11, ResultValue12>,
  f13: Pipeline.StepFunction<ResultValue12, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ResultValue10,
  ResultValue11,
  ResultValue12,
  ResultValue13,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ResultValue10>,
  f11: Pipeline.StepFunction<ResultValue10, ResultValue11>,
  f12: Pipeline.StepFunction<ResultValue11, ResultValue12>,
  f13: Pipeline.StepFunction<ResultValue12, ResultValue13>,
  f14: Pipeline.StepFunction<ResultValue13, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ResultValue10,
  ResultValue11,
  ResultValue12,
  ResultValue13,
  ResultValue14,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ResultValue10>,
  f11: Pipeline.StepFunction<ResultValue10, ResultValue11>,
  f12: Pipeline.StepFunction<ResultValue11, ResultValue12>,
  f13: Pipeline.StepFunction<ResultValue12, ResultValue13>,
  f14: Pipeline.StepFunction<ResultValue13, ResultValue14>,
  f15: Pipeline.StepFunction<ResultValue14, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

export function pipe<
  ValueType,
  ResultValue1,
  ResultValue2,
  ResultValue3,
  ResultValue4,
  ResultValue5,
  ResultValue6,
  ResultValue7,
  ResultValue8,
  ResultValue9,
  ResultValue10,
  ResultValue11,
  ResultValue12,
  ResultValue13,
  ResultValue14,
  ResultValue15,
  ReturnType
>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ResultValue5>,
  f6: Pipeline.StepFunction<ResultValue5, ResultValue6>,
  f7: Pipeline.StepFunction<ResultValue6, ResultValue7>,
  f8: Pipeline.StepFunction<ResultValue7, ResultValue8>,
  f9: Pipeline.StepFunction<ResultValue8, ResultValue9>,
  f10: Pipeline.StepFunction<ResultValue9, ResultValue10>,
  f11: Pipeline.StepFunction<ResultValue10, ResultValue11>,
  f12: Pipeline.StepFunction<ResultValue11, ResultValue12>,
  f13: Pipeline.StepFunction<ResultValue12, ResultValue13>,
  f14: Pipeline.StepFunction<ResultValue13, ResultValue14>,
  f15: Pipeline.StepFunction<ResultValue14, ResultValue15>,
  f16: Pipeline.StepFunction<ResultValue15, ReturnType>
): Pipeline.PipelineFunction<ValueType, ReturnType>;

/**
 * Create a pipeline of Pipeline.StepFunctions executing one after the other.
 * @export
 * @template TIn
 * @template TOut
 * @param {...functions: Pipeline.StepFunction<TIn, any>[]} functions
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 * @example
 * const { pipe } = require('@batuajs/core');
 * const { getCats } = require('./my-datasource');
 *
 * operations.v1.op1.setup(pipe(
 *    getCats(),
 *    (res) => ({...res, test:1 })
 * ));
 */
export function pipe<T, R>(
  ...functions: Array<Pipeline.StepFunction<T, R>>
): Pipeline.PipelineFunction<T, R> {
  if (functions.length === 0 || !functions.every(fn => typeof fn === 'function')) {
    throw new Error('A Pipeline.StepFunction must be a function.');
  }

  // Merge all pipeline functions in one composited function
  const composition: Pipeline.StepFunction<T, R> = functions.reduce(
    (acc: Pipeline.StepFunction<T, R> | undefined, fn) => {
      // First iteration will always return the first function since the default value is undefined
      if (!acc) {
        return fn;
      }
      // eslint-disable-next-line no-param-reassign
      acc = compose(acc, fn);

      return acc;
    },
    undefined
  ) as Pipeline.StepFunction<T, R>;

  let errorHandler: Pipeline.CatchError<GenericError>;
  function pipelineFunction(prev: T, ctx: Context, bautaJS: BautaJSInstance): PromiseLike<R> | R {
    try {
      const result = composition(prev, ctx, bautaJS);
      if (isPromise(result)) {
        // If is a promise, control the error using the promise.catch.
        return (result as Promise<R>).catch((e: GenericError) => {
          if (errorHandler) {
            return errorHandler(e, ctx, bautaJS) as any;
          }
          throw e;
        });
      }
      return result;
    } catch (e: any) {
      // In case is not a promise the execution will simply throw and it has to be controlled by a try catch and send it to the error handler function if there is any.
      if (errorHandler) {
        return errorHandler(e, ctx, bautaJS) as any;
      }
      throw e;
    }
  }
  pipelineFunction.catchError = function cathError(
    fn: Pipeline.CatchError<any>
  ): Pipeline.StepFunction<T, R> {
    errorHandler = fn;

    return pipelineFunction;
  };

  return pipelineFunction;
}
