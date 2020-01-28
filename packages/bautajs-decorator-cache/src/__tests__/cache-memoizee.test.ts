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
import memoizee from 'memoizee';
import { cache } from '../index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

jest.mock('memoizee');

describe('cache push', () => {
  let bautajs: BautaJS;
  beforeEach(async () => {
    jest.clearAllMocks();

    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    await bautajs.bootstrap();
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
