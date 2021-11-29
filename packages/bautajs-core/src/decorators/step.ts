import { Pipeline } from '../types';

export function step<TIn, TOut>(fn: Pipeline.StepFunction<TIn, TOut>) {
  return fn;
}

export default step;
