import { GenericError, Pipeline, Context, BautaJSInstance } from '../types';
import { isPromise } from '../utils/is-promise';
import { compose } from './pipeline';

const defaultErrorHandler: Pipeline.CatchError<GenericError> = e => {
  throw e;
};

export function tap<ValueType, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ReturnType>
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<ValueType, ResultValue1, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ReturnType>
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<ValueType, ResultValue1, ResultValue2, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ReturnType>
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<ValueType, ResultValue1, ResultValue2, ResultValue3, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ReturnType>
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<ValueType, ResultValue1, ResultValue2, ResultValue3, ResultValue4, ReturnType>(
  f1: Pipeline.StepFunction<ValueType, ResultValue1>,
  f2: Pipeline.StepFunction<ResultValue1, ResultValue2>,
  f3: Pipeline.StepFunction<ResultValue2, ResultValue3>,
  f4: Pipeline.StepFunction<ResultValue3, ResultValue4>,
  f5: Pipeline.StepFunction<ResultValue4, ReturnType>
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<
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
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<
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
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<
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
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<
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
): Pipeline.PipelineFunction<ValueType, ValueType>;

export function tap<
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
): Pipeline.PipelineFunction<ValueType, ValueType>;

/**
 * Decorator that allows to transparently perform actions or side-effects
 * without losing the initial value that triggered them.
 *
 * All the step functions inside the tap pass the value as in a pipeline, but
 * the result of the tap will be the value of the previous step.
 *
 * If an error occurs in the flow inside the tap, the flow is interrupted and goes
 * to the error handler. This is to support asynchronous validations inside tap.
 *
 * It is important to note that tap does not parallelize any execution of the promises
 * inside the decorator. The execution will have to finish before the next step.
 *
 * @param {stepFunctions: Array<Pipeline.StepFunction<T, R>>} stepFunctions - The step functions to execute
 * @returns {Pipeline.StepFunction<TIn, TIn>}
 *
 * @example
 *
 *
 */

export function tap<T, R>(
  ...stepFunctions: Array<Pipeline.StepFunction<T, R>>
): Pipeline.StepFunction<T, T> {
  if (stepFunctions.length === 0 || !stepFunctions.every(fn => typeof fn === 'function')) {
    throw new Error('All tap inputs must be a function or a promise.');
  }

  // Merge all step functions in one composited step function
  const composition: Pipeline.StepFunction<T, R> = stepFunctions.reduce(
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

  let errorHandler: Pipeline.CatchError<GenericError> = defaultErrorHandler;

  function tapStepFunction(prev: T, ctx: Context, bautaJS: BautaJSInstance): PromiseLike<T> | T {
    try {
      const result = composition(prev, ctx, bautaJS);

      if (isPromise(result)) {
        // If it is a promise we either return the value of the previous step or we interrup the tap flow if an error has occurred
        return (result as Promise<R>)
          .then(() => prev) // tap behaviour is ignoring the results of its steps and return the result value of the previous step
          .catch((e: GenericError) => {
            // This pattern is to ensure that when the error handler throws we throw, and if the error handler *does not* throw,
            // tap behaviour is maintained and we return the result value of the previous step
            errorHandler(e, ctx, bautaJS) as any;
            return prev;
          });
      }

      return prev;
    } catch (e: any) {
      // This pattern is to ensure that when the error handler throws we throw, and if the error handler *does not* throw,
      // tap behaviour is maintained and we return the result value of the previous step
      errorHandler(e, ctx, bautaJS) as any;
      return prev;
    }
  }

  tapStepFunction.catchError = function catchError(
    fn: Pipeline.CatchError<any>
  ): Pipeline.StepFunction<T, T> {
    // Even when through casting we can bypass the typescript type check we do not allow non-functions as this parameter
    if (typeof fn !== 'function') {
      throw new Error('Tap catchError function must be called with a function or a promise.');
    }
    errorHandler = fn;

    return tapStepFunction;
  };

  return tapStepFunction;
}
