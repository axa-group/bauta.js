/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { logger } from '../logger';
import { Context, EventTypes, HandlerAccesor, Pipeline, StepFn } from '../utils/types';

export class Accesor<TReq, TRes> implements HandlerAccesor<TReq, TRes> {
  private accesor: StepFn<TReq, TRes, any, any> = () => undefined;

  get handler(): StepFn<TReq, TRes, any, any> {
    return this.accesor;
  }

  set handler(fn: StepFn<TReq, TRes, any, any>) {
    this.accesor = fn;
  }
}

export class PipelineBuilder<TReq, TRes, TIn> implements Pipeline<TReq, TRes, TIn> {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public readonly accesor: HandlerAccesor<TReq, TRes>,
    private readonly serviceId: string,
    private readonly version: string,
    private readonly operationId: string // eslint-disable-next-line no-empty-function
  ) {}

  push<TOut>(fn: StepFn<TReq, TRes, TIn, TOut>): Pipeline<TReq, TRes, TOut> {
    if (typeof fn !== 'function') {
      throw new Error(
        `An step can not be undefined on ${this.serviceId}.${this.version}.${this.operationId}`
      );
    }

    this.accesor.handler = this.merge<any, any>(this.accesor.handler, fn);

    logger.info(
      `[OK] ${fn.name || 'anonymous function'} pushed to ${this.serviceId}.${this.version}.${
        this.operationId
      }`
    );
    logger.events.emit(EventTypes.PUSH_STEP, {
      step: fn,
      serviceId: this.serviceId,
      version: this.version,
      operationId: this.operationId
    });

    return new PipelineBuilder<TReq, TRes, TOut>(
      this.accesor,
      this.serviceId,
      this.version,
      this.operationId
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private merge<T, TOut>(
    fn1: StepFn<TReq, TRes, TIn, T>,
    fn2: StepFn<TReq, TRes, T, TOut>
  ): StepFn<TReq, TRes, TIn, TOut> {
    return (prev: TIn, ctx: Context<TReq, TRes>) => {
      const res = fn1(prev, ctx);
      if (res instanceof Promise) {
        return res.then(r => fn2(r, ctx));
      }
      return fn2(res, ctx);
    };
  }
}

export default PipelineBuilder;
