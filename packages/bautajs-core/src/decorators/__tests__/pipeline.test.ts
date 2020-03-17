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
  beforeEach(async () => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    await bautajs.bootstrap();
  });

  test('should execute the pipeline without add it into bautajs', async () => {
    const myPipeline = pipelineBuilder(p => p.push(() => [{ id: 1, name: 'pet' }]));

    expect(
      await myPipeline(
        null,
        createContext({ req: { query: {}, id: 1 }, res: {} }, bautajs.logger),
        bautajs
      )
    ).toStrictEqual([{ id: 1, name: 'pet' }]);
  });

  test('should execute the pipeline created by the pipeline decorator', async () => {
    const myPipeline = pipelineBuilder(p => p.push(() => [{ id: 1, name: 'pet' }]));
    bautajs.operations.v1.operation1.setup(p => {
      p.pushPipeline(myPipeline);
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { query: {}, id: 1 }, res: {} })
    ).toStrictEqual([{ id: 1, name: 'pet' }]);
  });

  test('should execute the pipeline but go to the error handler if step is not a promise', async () => {
    const myPipeline = pipelineBuilder(p =>
      p
        .push((_, ctx) => {
          return ctx.req.params.id;
        })
        .push(value => {
          if (value === 0) {
            throw new Error('I have zeros');
          }
          return [{ id: 1, name: 'pet' }];
        })
        .onError((err, _, bauta) => {
          return { err, bauta };
        })
    );

    const result = await myPipeline(
      null,
      createContext({ req: { id: 1, params: { id: 0 } }, res: {} }, bautajs.logger),
      bautajs
    );

    // We are only interested in checking that bauta indeed is accessible from the onError handler
    expect(result).toBeDefined();
    expect(result.err).toBeDefined();
    expect(result.bauta).toBeDefined();
    expect(result.bauta.logger).toBeDefined();
  });

  test('should execute the pipeline but go to the error handler if step is a promise', async () => {
    const myPipeline = pipelineBuilder(p =>
      p
        .push((_, ctx) => {
          return ctx.req.params.id;
        })
        .push(async value => {
          if (value === 0) {
            throw new Error('I have zeros');
          }
          return [{ id: 1, name: 'pet' }];
        })
        .onError((err, _, bauta) => {
          return { err, bauta };
        })
    );

    const result = await myPipeline(
      null,
      createContext({ req: { id: 1, params: { id: 0 } }, res: {} }, bautajs.logger),
      bautajs
    );

    // We are only interested in checking that bauta indeed is accessible from the onError handler
    expect(result).toBeDefined();
    expect(result.err).toBeDefined();
    expect(result.bauta).toBeDefined();
    expect(result.bauta.logger).toBeDefined();
  });
});
