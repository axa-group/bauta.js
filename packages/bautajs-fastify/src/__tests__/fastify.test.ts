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
import FormData from 'form-data';
import { Readable } from 'stream';
import { resolver, defaultLogger, pipe, asPromise } from '@axa-group/bautajs-core';
import fastify, { FastifyInstance } from 'fastify';
import { bautajsFastify } from '../index';
import { getRequest, getResponse } from '../operators';

const apiDefinition = require('./fixtures/test-api-definitions.json');
const apiDefinitionSwagger2 = require('./fixtures/test-api-definitions-swagger-2.json');
const apiDefinitionSwaggerWithExtraTag = require('./fixtures/test-api-definition-extra-tag.json');

describe('bautaJS fastify tests', () => {
  describe('bautaJS fastify generic test', () => {
    let fastifyInstance: FastifyInstance<any>;
    beforeEach(() => {
      fastifyInstance = fastify();
    });
    afterEach(() => {
      fastifyInstance.close();
    });
    test('should disable the strict serialization from fastify', async () => {
      const expected = {
        id: 134,
        name: 'pet2',
        customPropertyNotInAPIdefinition:
          'this is a custom property not defined on OPENAPI definition'
      };
      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolvers: [
          operations => {
            operations.operation1.setup(() => [expected]);
          }
        ],
        apiBasePath: '/api/',
        prefix: 'v1',
        strictResponseSerialization: false
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });
      expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(JSON.parse(res.payload)).toStrictEqual([expected]);
    });

    test('strict serialization from fastify should be enabled by default if an schema is provided', async () => {
      const expected = {
        id: 134,
        name: 'pet2'
      };
      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolvers: [
          operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2',
                customPropertyNotInAPIdefinition:
                  'this is a custom property not defined on OPENAPI definition'
              }
            ]);
          }
        ],
        apiBasePath: '/api/',
        prefix: '/v1/'
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });

      expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(JSON.parse(res.payload)).toStrictEqual([expected]);
    });

    test('should expose the given openAPI endpoints with an fastify API', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        apiBasePath: '/api/',
        prefix: '/v1/'
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });

      expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(JSON.parse(res.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should allow adding hooks only to the api routes', async () => {
      const spy = jest.fn();
      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        apiBasePath: '/api/',
        prefix: '/v1/',
        explorer: {
          enabled: true
        },
        apiHooks: {
          preValidation(_req, _res, next) {
            spy('preValidation');
            next();
          }
        }
      });

      // This will call the api hook prevalidation
      await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });

      // This won't call the apiHooks
      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1'
      });

      // 301 is returned by the swagger explorer
      expect(res.statusCode).toBe(301);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('preValidation');
    });

    test('should not expose the endpoints that have been configured as private', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/private-operation-resolver.js'
        )
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });

      expect(res.statusCode).toBe(404);
    });

    test('should not send the response again if already has been sent', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolvers: [
          operations => {
            operations.operation1.setup((_, ctx) => {
              const res = getResponse(ctx);
              res.send([
                {
                  id: 134,
                  name: 'pet2'
                }
              ]);
            });
          }
        ],
        apiBasePath: '/api/',
        prefix: '/v1/'
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should not send the response again if already has been sent on a readable pipe', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: '/v1/',
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operationStream.setup((_, ctx) => {
              const res = getResponse(ctx);
              // Create a buffer to hold the response chunks
              const s = new Readable();
              // eslint-disable-next-line no-underscore-dangle
              s._read = () => {};

              res.header('Content-disposition', 'attachment; filename="file.pdf');
              res.header('Content-type', 'application/octet-stream');
              s.push('1');
              setTimeout(() => {
                s.push('2');
                s.push(null);
              }, 500);
              s.push('3');

              return s;
            });
          })
        ]
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test-stream'
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-disposition']).toBe('attachment; filename="file.pdf');
      expect(res.payload).toBe('132');
    });

    test('should not send the response again if already has been sent on the res raw', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: '/v1/',
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operationStream.setup(
              asPromise((_, ctx, _bautajs, done) => {
                const res = getResponse(ctx);
                // Create a buffer to hold the response chunks
                const s = new Readable();
                // eslint-disable-next-line no-underscore-dangle
                s._read = () => {};

                res.raw.setHeader('Content-disposition', 'attachment; filename="file.pdf');
                res.raw.setHeader('Content-type', 'application/octet-stream');
                s.push('1');
                setTimeout(() => {
                  s.push('2');
                  s.push(null);
                }, 500);
                s.push('3');

                s.pipe(res.raw);

                s.on('end', done);
                s.on('error', done);
              })
            );
          })
        ]
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test-stream'
      });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-disposition']).toBe('attachment; filename="file.pdf');
      expect(res.payload).toBe('132');
    });

    test('should allow set custom headers', async () => {
      const form = new FormData();
      fastifyInstance.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: 'v1',
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operationStream.setup((_, ctx) => {
              const res = getResponse(ctx);
              form.append('part1', 'part 1 data');
              form.append('part2', 'part 2 data');
              res.header('Content-type', `multipart/form-data; boundary=${form.getBoundary()}`);

              return form;
            });
          })
        ]
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test-stream'
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toStrictEqual(
        `multipart/form-data; boundary=${form.getBoundary()}`
      );
    });

    test('should allow swagger 2.0', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: 'v1',
        apiDefinition: apiDefinitionSwagger2,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });
      expect(res.statusCode).toBe(200);

      expect(JSON.parse(res.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should not expose the swagger if explorer is set to false', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: 'v1',
        apiDefinition: apiDefinitionSwagger2,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        explorer: { enabled: false }
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/openapi.json'
      });

      expect(res.statusCode).toBe(404);
    });

    test('should expose the swagger by default', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: 'v1',
        apiDefinition: apiDefinitionSwagger2,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/openapi.json'
      });

      const res2 = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1'
      });

      expect(res.statusCode).toBe(200);
      expect(res2.statusCode).toBe(301);
    });

    test('should only show the tags that are in the exposed routes', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: 'v1',
        apiDefinition: apiDefinitionSwaggerWithExtraTag,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/openapi.json'
      });

      expect(res.body).not.toContain('extraTag');
    });

    test('should expose the swagger or openapi json by default', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinition: apiDefinitionSwagger2,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        apiBasePath: '/api/',
        prefix: '/v1/'
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/openapi.json'
      });

      expect(res.statusCode).toBe(200);
    });
    test('should return a 204 empty response if the pipeline do not return anything', async () => {
      const fs = fastify();
      fs.register(bautajsFastify, {
        apiDefinition,
        resolvers: [
          op => {
            op.operation204.setup(() => {});
          }
        ],
        apiBasePath: '/api/',
        prefix: '/v1/'
      });

      const res = await fs.inject({
        method: 'GET',
        url: '/v1/api/test204',
        headers: {
          'x-request-id': 2
        }
      });
      fs.close();

      expect(res.body).toBe('');
    });
  });

  describe('bautaJS fastify with plugins', () => {
    test('should set the x-request-id on the response headers', async () => {
      const fs = fastify({
        requestIdHeader: 'x-request-id'
      });
      fs.register(bautajsFastify, {
        apiDefinition,
        resolvers: [
          op => {
            op.operation1.setup(() => {
              return {};
            });
          }
        ]
      });

      const res = await fs.inject({
        method: 'GET',
        url: '/v1/api/test',
        headers: {
          'x-request-id': 2
        }
      });
      fs.close();

      expect(res.headers['x-request-id']).toBe('2');
    });

    test('should allow override the error handler', async () => {
      const fs = fastify();
      fs.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: 'v1',
        apiDefinition,
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/operation-resolver-error.js'
        )
      });
      fs.setErrorHandler((error, _request, reply) => {
        reply.send({ message: error.message, status: error.statusCode });
      });

      const res = await fs.inject({
        method: 'GET',
        url: '/v1/api/test'
      });
      fs.close();

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.payload)).toStrictEqual({
        message: 'some error'
      });
    });
  });

  describe('bautaJS fastify request cancellation', () => {
    test('should log a message in case of the request was canceled', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'error').mockImplementation();
      logger.child = () => {
        return logger;
      };
      const fs = fastify({ logger });
      fs.register(bautajsFastify, {
        apiBasePath: '/api/',
        prefix: 'v1',
        apiDefinition,
        resolvers: [
          operations => {
            operations.operation1.setup(
              pipe(
                (_, ctx) => {
                  const req = getRequest(ctx);
                  setTimeout(() => req.raw.emit('aborted'), 200);
                },
                () => new Promise(resolve => setTimeout(() => resolve({ ok: 'ok' }), 200))
              )
            );
          }
        ]
      });

      await fs.inject({
        method: 'GET',
        url: '/v1/api/test'
      });

      expect(logger.error).toHaveBeenCalledWith(
        { message: 'Request was aborted by the requester intentionally' },
        'The request was canceled by the requester.'
      );
    });
  });

  describe('bautaJS fastify multiple versions/instances', () => {
    let fastifyInstance: FastifyInstance<any>;
    beforeEach(() => {
      fastifyInstance = fastify();
    });
    afterEach(() => {
      fastifyInstance.close();
    });
    test('should allow to specify multiple bautajs instances in different paths', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        apiBasePath: '/api/',
        prefix: '/v1/'
      });

      fastifyInstance.register(bautajsFastify, {
        apiDefinition,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        apiBasePath: '/api/',
        prefix: '/v2/'
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/api/test'
      });
      const res2 = await fastifyInstance.inject({
        method: 'GET',
        url: '/v2/api/test'
      });

      expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(JSON.parse(res.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
      expect(res2.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(JSON.parse(res2.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });
  });
});
