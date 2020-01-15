/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { PipelineSetup, OperatorFunction, EventTypes } from '../utils/types';
import { Builder } from '../core/pipeline-builder';
import { Accesor } from '../core/accesor';
import { logger } from '../logger';

let pipelineCounter = 0;

function defaultOnPush(param: any) {
  logger.debug(
    `[OK] ${param.name || 'anonymous function'} pushed to anonymous pipeline ${pipelineCounter}`
  );
  logger.events.emit(EventTypes.PUSH_OPERATOR, {
    operator: param
  });
}

/**
 * A decorator to give itellicense to a pipeline.
 * @export
 * @template TIn
 * @param {PipelineSetup<TIn>} pipelineSetup
 * @returns PipelineSetup<TIn>
 */
export function pipeline<TIn>(pipelineSetup: PipelineSetup<TIn>): PipelineSetup<TIn> {
  return pipelineSetup;
}

/**
 * A decorator to create a pipeline that can be executed.
 * @export
 * @template TIn
 * @template TOut
 * @param {PipelineSetup<TIn>} pipelineSetup
 * @param {(param: any) => void} onPush
 * @returns OperatorFunction<TIn, TOut>
 */
export function pipelineBuilder<TIn, TOut>(
  pipelineSetup: PipelineSetup<TIn>,
  onPush?: (param: any) => void
): OperatorFunction<TIn, TOut> {
  pipelineCounter += 1;

  const pp = new Builder<TIn>(new Accesor(), onPush || defaultOnPush);
  pipelineSetup(pp);
  return (prev, ctx, bautajs) => {
    let result;

    // if not a promise but throw, manage the error
    try {
      result = pp.accesor.handler(prev, ctx, bautajs);
    } catch (e) {
      return pp.accesor.errorHandler(e, ctx);
    }

    if (result instanceof Promise) {
      result = result.catch(async (e: Error) => pp.accesor.errorHandler(e, ctx));
    }

    return result;
  };
}

export default pipeline;
