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
import {
  BautaJSInstance,
  Context,
  HandlerAccesor,
  PipelineBuilder,
  OperatorFunction,
  ErrorHandler
} from '../utils/types';
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
