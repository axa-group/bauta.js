import { Pipeline } from '../types.js';

export function step<TIn, TOut>(fn: Pipeline.StepFunction<TIn, TOut>) {
  return fn;
}

export default step;
