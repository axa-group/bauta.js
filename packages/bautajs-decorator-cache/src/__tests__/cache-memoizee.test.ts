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
import { BautaJS, Document, pipelineBuilder } from '@bautajs/core';
import { cache } from '../index';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('cache push', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    jest.useFakeTimers();

    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  test('should cache the requests with the same id', async () => {
    const fn = jest.fn(() => [{ id: 1, name: 'pet' }]);
    const pp = pipelineBuilder(p =>
      p
        .push(() => [{ a: '123' }])
        .push((result: any) => ({ ...result[0], new: 1 }))
        .push(fn)
    );
    bautajs.operations.v1.operation1.setup(p => p.push(cache(pp, ([, ctx]) => ctx.id)));

    await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} });
    await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} });

    expect(fn.mock.calls).toHaveLength(1);
  });

  test('should allow memoizee options', async () => {
    const fn = jest.fn(() => [{ id: 1, name: 'pet' }]);
    const pp = pipelineBuilder(p =>
      p
        .push(() => [{ a: '123' }])
        .push((result: any) => ({ ...result[0], new: 1 }))
        .push(fn)
    );

    bautajs.operations.v1.operation1.setup(p =>
      p.push(
        cache(pp, ([, ctx]) => ctx.id, {
          maxAge: 1000
        })
      )
    );
    jest.runAllTimers();
    await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} });
    jest.runAllTimers();
    await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} });
    jest.runAllTimers();
    expect(fn.mock.calls).toHaveLength(2);
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
