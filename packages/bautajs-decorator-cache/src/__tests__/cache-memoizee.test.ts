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
import { BautaJS, Document, pipelineBuilder } from '@bautajs/core';
import memoizee from 'memoizee';
import { cache } from '../index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

jest.mock('memoizee');

describe('cache push', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    jest.clearAllMocks();

    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });
  test('should pass the options to memoize fn', () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );
    const normalizer = ([, ctx]) => ctx.id;
    bautajs.operations.v1.operation1.setup(p =>
      p.push(
        cache(pp, <any>normalizer, {
          maxAge: 1000
        })
      )
    );
    expect(memoizee).toHaveBeenCalledWith(pp, { normalizer, maxAge: 1000 });
  });

  test('should throw an error if normalizer function is not specified', async () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );

    expect(() =>
      bautajs.operations.v1.operation1.setup(p =>
        p.push(
          // @ts-ignore
          cache(pp)
        )
      )
    ).toThrow(
      'normalizer: (args)=>{} function is a mandatory parameter to calculate the cache key'
    );
  });
});
