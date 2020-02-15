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

    expect(await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} })).toStrictEqual([
      { id: 1, name: 'pet' }
    ]);
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

    expect(await bautajs.operations.v1.operation1.run({ req: { id: 3 }, res: {} })).toStrictEqual([
      { id: 3, name: 'pet' }
    ]);
  });
});
