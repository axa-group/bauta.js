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
const fastify = require('fastify')();
const { resolver, pipe } = require('@bautajs/core');
const { bautajsFastify } = require('../dist/index');

const apiDefinition = {
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

fastify.register(bautajsFastify, {
  apiDefinition,
  resolvers: [
    resolver(operations => {
      operations.operation1.setup(pipe(() => ({ hello: 'world' })));
    })
  ]
});

(async () => {
  fastify.listen(3000, err => {
    if (err) throw err;
    console.info('Server listening on localhost:', fastify.server.address().port);
  });
})();
