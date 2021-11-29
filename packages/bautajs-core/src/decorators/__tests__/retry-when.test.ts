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

import { BautaJSInstance, createContext, retryWhen } from '../..';

describe('retryWhen decorator', () => {
  test('should execute pipeline until the condition is meet with default options', async () => {
    let increaseMe = 1;
    const stepToBeExecuted = () => {
      increaseMe += 1;

      return increaseMe;
    };

    const condition = (prev: number) => {
      return prev > 3;
    };

    const pipeline = retryWhen(stepToBeExecuted, condition);

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toBe(4);
  });

  test('should throw an error if no result is provided in the default max retries', async () => {
    let increaseMe = 0;
    const stepToBeExecuted = () => {
      increaseMe += 1;

      return increaseMe;
    };

    const condition = (prev: number) => {
      return prev > 3;
    };

    const pipeline = retryWhen(stepToBeExecuted, condition);

    await expect(() => pipeline({}, createContext({}), {} as BautaJSInstance)).rejects.toThrow(
      expect.objectContaining({ message: 'Condition was not meet in 3 retries.' })
    );
  });

  test('should execute pipeline until the condition is meet with non default options', async () => {
    let increaseMe = 1;
    const stepToBeExecuted = () => {
      increaseMe += 1;

      return increaseMe;
    };

    const condition = (prev: number) => {
      return prev > 6;
    };

    const options = {
      maxRetryAttempts: 7,
      scalingDuration: 100
    };

    const pipeline = retryWhen(stepToBeExecuted, condition, options);

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toBe(7);
  });

  test('should throw a custom error when required if specified and maxRetryAttempts are reached', async () => {
    let increaseMe = 0;
    const stepToBeExecuted = () => {
      increaseMe += 1;

      return increaseMe;
    };

    const condition = (prev: number) => {
      return prev > 7;
    };

    const options = {
      maxRetryAttempts: 7,
      scalingDuration: 100,
      error: new Error('This is a custom error message')
    };

    const pipeline = retryWhen(stepToBeExecuted, condition, options);

    await expect(() => pipeline({}, createContext({}), {} as BautaJSInstance)).rejects.toThrow(
      expect.objectContaining({ message: 'This is a custom error message' })
    );
  });

  test('should throw an error if the request is cancelled in the middle of the pipeline execution', async () => {
    let increaseMe = 0;
    const stepToBeExecuted = (_: any, ctx: { token: { isCanceled: boolean } }) => {
      increaseMe += 1;

      // This simulates the user cancelling the request in the middle of this pipeline execution
      if (increaseMe === 3) {
        ctx.token.isCanceled = true;
      }

      return increaseMe;
    };

    const condition = (prev: number) => {
      return prev > 7;
    };

    const options = {
      maxRetryAttempts: 7,
      scalingDuration: 100,
      error: new Error('This is a custom error message')
    };

    const pipeline = retryWhen(stepToBeExecuted, condition, options);

    await expect(() => pipeline({}, createContext({}), {} as BautaJSInstance)).rejects.toThrow(
      expect.objectContaining({ message: 'Request cancelled by the user during attempt number 3.' })
    );
  });
});
