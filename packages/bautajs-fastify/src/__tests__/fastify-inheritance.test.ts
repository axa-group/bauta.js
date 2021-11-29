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
// eslint-disable-next-line no-unused-vars
import { BautaJS } from '@axa-group/bautajs-core';
import fastify, { FastifyInstance } from 'fastify';
import { bautajsFastify } from '../index';

const [
  apiDefinition,
  apidDefinitionEmpty
] = require('./fixtures/test-api-definition-inheritance.json');

describe('bautaJS fastify inheritance', () => {
  let fastifyInstance: FastifyInstance<any>;
  beforeEach(() => {
    fastifyInstance = fastify();
  });
  afterEach(() => {
    fastifyInstance.close();
  });

  test('a Bauta.js instance with should inherit the operation resolver behaviour from another a Bauta.js if it is not implemented.', async () => {
    const bautajsV1 = new BautaJS({
      apiDefinition,
      resolvers: [
        operations => {
          operations.operation1.setup(() => ({ test: 'v1' }));
        }
      ]
    });

    fastifyInstance
      .register(bautajsFastify, {
        bautajsInstance: bautajsV1,
        apiBasePath: '/api/',
        prefix: '/v1/'
      })
      .after(() => {
        const bautajsV2 = new BautaJS({
          apiDefinition,
          resolvers: []
        });
        bautajsV2.inheritOperationsFrom(bautajsV1);
        fastifyInstance.register(bautajsFastify, {
          bautajsInstance: bautajsV2,
          apiBasePath: '/api/',
          prefix: '/v2/'
        });
      });

    const resV1 = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });
    const bodyV1 = JSON.parse(resV1.body);

    const resV2 = await fastifyInstance.inject({
      method: 'GET',
      url: '/v2/api/test'
    });
    const bodyV2 = JSON.parse(resV2.body);

    expect(resV1.statusCode).toBe(resV2.statusCode);
    expect(bodyV1).toStrictEqual(bodyV2);
  });

  test('bautajs-fastify should set up their bauta.js instance inheriting the operation resolver behaviour from another a Bauta.js if it is not implemented.', async () => {
    const bautajsV1 = new BautaJS({
      apiDefinition,
      resolvers: [
        operations => {
          operations.operation1.setup(() => ({ test: 'v1' }));
        }
      ]
    });

    fastifyInstance
      .register(bautajsFastify, {
        bautajsInstance: bautajsV1,
        apiBasePath: '/api/',
        prefix: '/v1/'
      })
      .after(() => {
        fastifyInstance.register(bautajsFastify, {
          apiDefinition,
          apiBasePath: '/api/',
          prefix: '/v2/',
          inheritOperationsFrom: bautajsV1
        });
      });

    const resV1 = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });
    const bodyV1 = JSON.parse(resV1.body);

    const resV2 = await fastifyInstance.inject({
      method: 'GET',
      url: '/v2/api/test'
    });
    const bodyV2 = JSON.parse(resV2.body);

    expect(resV1.statusCode).toBe(resV2.statusCode);
    expect(bodyV1).toStrictEqual(bodyV2);
  });

  test('bautajs-fastify should set up their bauta.js instance inheriting the operation resolver behaviour from another a Bauta.js if it is not defined on the API definition', async () => {
    const bautajsV1 = new BautaJS({
      apiDefinition,
      resolvers: [
        operations => {
          operations.operation1.setup(() => ({ test: 'v1' }));
        }
      ]
    });

    fastifyInstance
      .register(bautajsFastify, {
        bautajsInstance: bautajsV1,
        apiBasePath: '/api/',
        prefix: '/v1/'
      })
      .after(() => {
        fastifyInstance.register(bautajsFastify, {
          apiDefinition: apidDefinitionEmpty,
          apiBasePath: '/api/',
          prefix: '/v2/',
          inheritOperationsFrom: bautajsV1
        });
      });

    const resV1 = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });
    const bodyV1 = JSON.parse(resV1.body);

    const resV2 = await fastifyInstance.inject({
      method: 'GET',
      url: '/v2/api/test'
    });
    const bodyV2 = JSON.parse(resV2.body);

    expect(resV1.statusCode).toBe(resV2.statusCode);
    expect(bodyV1).toStrictEqual(bodyV2);
  });
});
