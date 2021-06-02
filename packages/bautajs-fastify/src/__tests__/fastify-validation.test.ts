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
import path from 'path';
import fastify, { FastifyInstance } from 'fastify';
import { bautajsFastify } from '../index';

const apiDefinitionCustomValidation = require('./fixtures/test-api-definitions-custom-validation.json');

describe('bautaJS fastify tests', () => {
  let fastifyInstance: FastifyInstance<any>;
  beforeEach(() => {
    fastifyInstance = fastify();
  });
  afterEach(() => {
    fastifyInstance.close();
  });

  test('should validate the request with the internal fastify validator but allowing custom format', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    const res = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test',
      query: {
        // @ts-ignore
        limit: 123
      }
    });

    const body = JSON.parse(res.body);
    expect(res.statusCode).toStrictEqual(400);
    expect(body.message).toStrictEqual(`The request was not valid`);
    expect(body.errors[0]).toStrictEqual({
      location: 'querystring',
      message: 'must match format "test"',
      errorCode: 'format'
    });
  });

  test('should validate the response with bautajs validator', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      ),
      enableResponseValidation: true
    });

    const res = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toStrictEqual(500);
    expect(body.message).toStrictEqual('Internal error');
    expect(body.errors).toStrictEqual([
      {
        path: '/0/id',
        location: 'response',
        message: 'must be integer',
        errorCode: 'type'
      }
    ]);
  });
  test('response validation should be disabled by default', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      ),
      strictResponseSerialization: false
    });

    const res = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});
