import { Pipeline } from '../types.js';
import { NotFoundError } from '../core/not-found-error.js';

export function buildDefaultStep(): Pipeline.StepFunction<any, any> {
  return () => {
    throw new NotFoundError('Not found');
  };
}

export default buildDefaultStep;
