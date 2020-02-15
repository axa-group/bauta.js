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
import { BautaJS, Document, createContext } from '../../index';
import { pipelineBuilder } from '../pipeline';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('pipeline decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  test('should execute the pipeline created by the pipeline decorator', async () => {
    const myPipeline = pipelineBuilder(p => p.push(() => [{ id: 1, name: 'pet' }]));
    bautajs.operations.v1.operation1.setup(p => {
      p.pushPipeline(myPipeline);
    });

    expect(await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} })).toStrictEqual([
      { id: 1, name: 'pet' }
    ]);
  });

  test('should execute the pipeline without add it into bautajs', async () => {
    const myPipeline = pipelineBuilder(p => p.push(() => [{ id: 1, name: 'pet' }]));

    expect(
      await myPipeline(null, createContext({ req: { id: 1 }, res: {} }), bautajs)
    ).toStrictEqual([{ id: 1, name: 'pet' }]);
  });
});
