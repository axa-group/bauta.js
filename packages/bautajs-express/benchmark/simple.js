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
const { resolver } = require('@bautajs/core');
const { BautaJSExpress } = require('../dist/index');

const apiDefinitions = [
  {
    openapi: '3.0.0',
    info: {
      version: 'v1',
      title: 'test'
    },
    servers: [
      {
        url: '/v1/api/'
      }
    ],
    paths: {
      '/op1': {
        get: {
          operationId: 'operation1',
          responses: {
            '200': {
              description: 'ok',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      hello: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
];

const bautajs = new BautaJSExpress(apiDefinitions, {
  resolvers: [
    resolver(operations => {
      operations.v1.operation1.setup(p => p.pipe(() => ({ hello: 'world' })));
    })
  ]
});

(async () => {
  await bautajs.applyMiddlewares({ morgan: { enabled: false } });
  bautajs.listen(8080);
})();
