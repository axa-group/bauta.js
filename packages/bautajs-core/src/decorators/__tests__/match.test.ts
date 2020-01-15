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
import { BautaJS, Document } from '../../index';
import { pipelineBuilder } from '../pipeline';
import { match } from '../match';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('match decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  test('should select the pipeline execution depending on the condition', async () => {
    const myPipeline1 = pipelineBuilder(p => p.push(() => [{ id: 1, name: 'pet' }]));
    const myPipeline2 = pipelineBuilder(p => p.push(() => [{ id: 3, name: 'pet' }]));
    bautajs.operations.v1.operation1.setup(p => {
      p.push(() => 1).push(
        match(m => m.on(prev => prev === 1, myPipeline1).otherwise(myPipeline2))
      );
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { query: {}, id: 1 }, res: {} })
    ).toStrictEqual([{ id: 1, name: 'pet' }]);
  });

  test('should use the default option if non of the options match', async () => {
    const myPipeline1 = pipelineBuilder(p => p.push(() => [{ id: 1, name: 'pet' }]));
    const myPipeline2 = pipelineBuilder(p => p.push(() => [{ id: 3, name: 'pet' }]));
    bautajs.operations.v1.operation1.setup(p => {
      p.push(() => 5).push(
        match(m =>
          m
            .on(prev => prev === 1, myPipeline1)
            .on(prev => prev === 2, myPipeline1)
            .otherwise(myPipeline2)
        )
      );
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { query: {}, id: 3 }, res: {} })
    ).toStrictEqual([{ id: 3, name: 'pet' }]);
  });
});
