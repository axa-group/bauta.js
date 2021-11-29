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
const http = require('http');
const stringify = require('fast-safe-stringify');
const { BautaJS, resolver, pipe } = require('../dist/index');

const apiDefinition = {
  openapi: '3.0.0',
  info: {
    version: 'v1',
    title: 'test'
  },
  servers: [
    {
      url: 'v1/api'
    }
  ],
  paths: {
    '/': {
      get: {
        operationId: 'operation1',
        responses: {
          200: {
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
};

const bautajs = new BautaJS({
  apiDefinition,
  resolvers: [
    resolver(operations => {
      operations.operation1.setup(pipe(() => ({ hello: 'world' })));
    })
  ]
});

(async () => {
  await bautajs.bootstrap();
  http
    .createServer(async (req, res) => {
      const response = await bautajs.operations.operation1.run({ req, res });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(stringify(response));
      res.end();
    })
    .listen(3000);
})();
