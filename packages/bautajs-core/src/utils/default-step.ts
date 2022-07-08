import { Pipeline } from '../types';
import { NotFoundError } from '../core/not-found-error';

export function buildDefaultStep(): Pipeline.StepFunction<any, any> {
  return () => {
    throw new NotFoundError('Not found');
  };
}

export default buildDefaultStep;
