// eslint-disable-next-line no-unused-vars
import { BautaJS, Document } from '@axa/bautajs-core';
import fastify, { FastifyInstance } from 'fastify';
import { bautajsFastify } from '../src/index.js';

import apiDefinitionsFixtures from './fixtures/test-api-definition-inheritance.json';

const [apiDefinition, apidDefinitionEmpty] = apiDefinitionsFixtures;

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
      apiDefinition: apiDefinition as Document,
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
          apiDefinition: apiDefinition as Document,
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
      apiDefinition: apiDefinition as Document,
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
          apiDefinition: apiDefinition as Document,
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
      apiDefinition: apiDefinition as Document,
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
          apiDefinition: apidDefinitionEmpty as Document,
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
