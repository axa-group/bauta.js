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
import {
  BautaJSInstance,
  Context,
  HandlerAccesor,
  PipelineBuilder,
  OperatorFunction,
  ErrorHandler
} from '../types';
import { Accesor } from './accesor';

export class Builder<TIn> implements PipelineBuilder<TIn> {
  constructor(
    public readonly accesor: HandlerAccesor = new Accesor(),
    private onPush?: (param: any) => void
  ) {
    // eslint-disable-next-line no-empty-function
  }

  onError(fn: ErrorHandler): void {
    if (typeof fn !== 'function') {
      throw new Error('The errorHandler must be a function.');
    }

    this.accesor.errorHandler = fn;
  }

  pushPipeline<TOut>(fn: OperatorFunction<TIn, TOut>): PipelineBuilder<TOut> {
    if (this.onPush) {
      this.onPush(fn);
    }

    return this.push<TOut>(fn);
  }

  push<TOut>(fn: OperatorFunction<TIn, TOut>): PipelineBuilder<TOut> {
    if (typeof fn !== 'function') {
      throw new Error('An OperatorFunction must be a function.');
    }

    this.accesor.handler = this.merge<any, any>(this.accesor.handler, fn);

    if (this.onPush) {
      this.onPush(fn);
    }

    return new Builder<TOut>(this.accesor, this.onPush);
  }

  pipe<TOut>(...fns: any[]): PipelineBuilder<TOut> {
    if (fns.length === 0) {
      throw new Error('At least one OperatorFunction must be specified.');
    }

    if (!fns.every((fn: Function) => typeof fn === 'function')) {
      throw new Error('An OperatorFunction must be a function.');
    }

    fns.forEach(fn => this.push(fn));

    return new Builder<TOut>(this.accesor, this.onPush);
  }

  // eslint-disable-next-line class-methods-use-this
  private merge<T, TOut>(
    fn1: OperatorFunction<TIn, T>,
    fn2: OperatorFunction<T, TOut>
  ): OperatorFunction<TIn, TOut> {
    return (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => {
      const res = fn1(prev, ctx, bautajs);
      if (res instanceof Promise) {
        return res.then(r => fn2(r, ctx, bautajs));
      }
      return fn2(res, ctx, bautajs);
    };
  }
}

export default Builder;
