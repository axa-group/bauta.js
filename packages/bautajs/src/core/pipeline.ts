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
import {
  BautaJSInstance,
  Context,
  EventTypes,
  HandlerAccesor,
  Pipeline,
  StepFn
} from '../utils/types';

export class Accesor implements HandlerAccesor {
  private accesor: StepFn<any, any> = () => undefined;

  get handler(): StepFn<any, any> {
    return this.accesor;
  }

  set handler(fn: StepFn<any, any>) {
    this.accesor = fn;
  }
}

export class PipelineBuilder<TIn> implements Pipeline<TIn> {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public readonly accesor: HandlerAccesor,
    private readonly serviceId: string,
    private readonly version: string,
    private readonly operationId: string // eslint-disable-next-line no-empty-function
  ) {}

  push<TOut>(fn: StepFn<TIn, TOut>): Pipeline<TOut> {
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

    return new PipelineBuilder<TOut>(this.accesor, this.serviceId, this.version, this.operationId);
  }

  // eslint-disable-next-line class-methods-use-this
  private merge<T, TOut>(fn1: StepFn<TIn, T>, fn2: StepFn<T, TOut>): StepFn<TIn, TOut> {
    return (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => {
      const res = fn1(prev, ctx, bautajs);
      if (res instanceof Promise) {
        return res.then(r => fn2(r, ctx, bautajs));
      }
      return fn2(res, ctx, bautajs);
    };
  }
}

export default PipelineBuilder;
