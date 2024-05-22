import { pipe } from '../pipeline.js';
import { match } from '../match.js';
import { createContext } from '../../utils/create-context.js';
import { BautaJSInstance } from '../../index.js';
import { jest } from '@jest/globals';

describe('match decorator', () => {
  test('should select the pipeline execution depending on the condition', () => {
    const myPipeline1 = pipe(() => [{ id: 1, name: 'pet' }]);
    const myPipeline2 = pipe(() => [{ id: 3, name: 'pet' }]);
    const pipeline = pipe(
      () => 1,
      match(m => m.on(prev => prev === 1, myPipeline1).otherwise(myPipeline2))
    );

    expect(pipeline(null, createContext({}), {} as BautaJSInstance)).toStrictEqual([
      { id: 1, name: 'pet' }
    ]);
  });

  test('should use the default option if non of the options match', () => {
    const myPipeline1 = pipe(() => [{ id: 1, name: 'pet' }]);
    const myPipeline2 = pipe(() => [{ id: 3, name: 'pet' }]);
    const pipeline = pipe(
      () => 5,
      match(m =>
        m
          .on(prev => prev === 1, myPipeline1)
          .on(prev => prev === 2, myPipeline1)
          .otherwise(myPipeline2)
      )
    );

    expect(pipeline(null, createContext({}), {} as BautaJSInstance)).toStrictEqual([
      { id: 3, name: 'pet' }
    ]);
  });

  test('match builder should be executed before the pipeline execution', () => {
    const myPipeline1 = pipe(() => [{ id: 1, name: 'pet' }]);
    const myPipeline2 = pipe(() => [{ id: 3, name: 'pet' }]);
    const someFuctionThatShouldBeExecuted = jest.fn(staticValue => {
      return (prev: any) => prev === staticValue;
    });

    const matchBuilder = jest.fn(m =>
      m
        .on(someFuctionThatShouldBeExecuted(1), myPipeline1)
        .on((prev: any) => prev === 2, myPipeline1)
        .otherwise(myPipeline2)
    );
    // We don't execute the pipeline.
    const pipeline = pipe(() => 5, match(matchBuilder));

    // We expect that those functions are executed before the pipeline execution.
    expect(matchBuilder).toHaveBeenCalledTimes(1);
    expect(someFuctionThatShouldBeExecuted).toHaveBeenCalledWith(1);

    // Now we execte the pipeline
    const result = pipeline(null, createContext({}), {} as BautaJSInstance);
    expect(result).toStrictEqual([{ id: 3, name: 'pet' }]);
  });
});
