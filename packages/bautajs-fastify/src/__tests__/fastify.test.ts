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
import { resolver, defaultLogger, pipe } from '@bautajs/core';
import fastify, { FastifyInstance } from 'fastify';
import { bautajsFastify } from '../index';
import { getRequest, getResponse } from '../operators';

const apiDefinitions = require('./fixtures/test-api-definitions.json');
const apiDefinitionsSwagger2 = require('./fixtures/test-api-definitions-swagger-2.json');

describe('bautaJS fastify tests', () => {
  describe('bautaJS fastify generic test', () => {
    let fastifyInstance: FastifyInstance<any>;
    beforeEach(() => {
      fastifyInstance = fastify();
    });
    afterEach(() => {
      fastifyInstance.close();
    });
    test('should expose the given swagger with an fastify API', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/api/v1/test'
      });

      expect(res.headers['content-type']).toStrictEqual('application/json; charset=utf-8');
      expect(JSON.parse(res.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should not expose the endpoints that have been configured as private', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions,
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/private-operation-resolver.js'
        )
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/api/v1/test'
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    test('should not send the response again if already has been sent', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions,
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/operation-resolver-send-response.js'
        )
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/api/v1/test'
      });

      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should not send the response again if already has been sent on a readable pipe', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions,
        resolvers: [
          resolver(operations => {
            operations.v1.operationStream.setup((_, ctx) => {
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
        url: '/api/v1/test-stream'
      });

      expect(res.statusCode).toStrictEqual(200);
      expect(res.headers['content-disposition']).toStrictEqual('attachment; filename="file.pdf');
      expect(res.payload).toStrictEqual('132');
    });

    test('should allow set custom headers', async () => {
      const form = new FormData();
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions,
        resolvers: [
          resolver(operations => {
            operations.v1.operationStream.setup((_, ctx) => {
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
        url: '/api/v1/test-stream'
      });

      expect(res.statusCode).toStrictEqual(200);
      expect(res.headers['content-type']).toStrictEqual(
        `multipart/form-data; boundary=${form.getBoundary()}`
      );
    });

    test('should allow swagger 2.0', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions: apiDefinitionsSwagger2,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/api/v1/test'
      });

      expect(res.statusCode).toStrictEqual(200);

      expect(JSON.parse(res.payload)).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should not expose the swagger if explorer is set to false', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions: apiDefinitionsSwagger2,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        explorer: { enabled: false }
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/openapi.json'
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    test('should expose the swagger or openapi json by default', async () => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinitions: apiDefinitionsSwagger2,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const res = await fastifyInstance.inject({
        method: 'GET',
        url: '/v1/openapi.json'
      });

      expect(res.statusCode).toStrictEqual(200);
    });
    test('should not give a timeout if response of the pipeline is undefined by a 204', async () => {
      const fs = fastify();
      fs.register(bautajsFastify, {
        apiDefinitions,
        resolvers: [
          op => {
            op.v1.operation204.setup(() => {});
          }
        ]
      });

      const res = await fs.inject({
        method: 'GET',
        url: '/api/v1/test204',
        headers: {
          'x-request-id': 2
        }
      });
      fs.close();

      expect(res.body).toStrictEqual('');
    });
  });

  describe('bautaJS fastify with plugins', () => {
    test('should set the x-request-id on the response headers', async () => {
      const fs = fastify({
        requestIdHeader: 'x-request-id'
      });
      fs.register(bautajsFastify, {
        apiDefinitions,
        resolvers: [
          op => {
            op.v1.operation1.setup(() => {
              return {};
            });
          }
        ]
      });

      const res = await fs.inject({
        method: 'GET',
        url: '/api/v1/test',
        headers: {
          'x-request-id': 2
        }
      });
      fs.close();

      expect(res.headers['x-request-id']).toStrictEqual('2');
    });

    test('should allow override the error handler', async () => {
      const fs = fastify();
      fs.register(bautajsFastify, {
        apiDefinitions,
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/operation-resolver-error.js'
        ),
        sensible: {
          enabled: true,
          options: {
            errorHandler: false
          }
        }
      });
      fs.setErrorHandler((error, _request, reply) => {
        reply.send({ message: error.message, status: error.statusCode });
      });

      const res = await fs.inject({
        method: 'GET',
        url: '/api/v1/test'
      });
      fs.close();

      expect(res.statusCode).toStrictEqual(500);
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
        apiDefinitions,
        resolvers: [
          operations => {
            operations.v1.operation1.setup(
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
        url: '/api/v1/test'
      });

      expect(logger.error).toHaveBeenCalledWith(
        'The request to /api/v1/test was canceled by the requester'
      );
    });
  });
});
