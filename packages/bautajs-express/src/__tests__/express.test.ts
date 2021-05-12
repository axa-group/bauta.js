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
import supertest from 'supertest';
import { Readable } from 'stream';
import { Response } from 'express';
import { resolver, asPromise, defaultLogger } from '@bautajs/core';
import { BautaJSExpress } from '../index';

const apiDefinitions = require('./fixtures/test-api-definitions.json');
const apiDefinitionsSwagger2 = require('./fixtures/test-api-definitions-swagger-2.json');
const apiDefinitionSwaggerCircularDeps = require('./fixtures/test-api-definitions-swagger-circular-deps.json');

describe('bautaJS express', () => {
  describe('request cancelation', () => {
    test('should trigger the aborted event when the client close the connection and log the error', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'error').mockImplementation();
      logger.child = () => logger;
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolvers: [
          operations => {
            operations.v1.operation1.setup(p =>
              p.pipe((_, ctx) => {
                ctx.req.socket.destroy();

                return new Promise(resolve => setTimeout(() => resolve({ result: 'ok' }), 500));
              })
            );
          }
        ],
        logger
      });

      await bautajs.applyMiddlewares();

      const request = supertest(bautajs.app).get('/api/v1/test').set({ 'x-request-id': '1' });
      expect.assertions(1);
      try {
        await request;
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(logger.error).toHaveBeenCalledWith(
          'The request to /api/v1/test was canceled by the requester'
        );
      }
    });
  });
  describe('express initialization', () => {
    test('should expose the given swagger with an express API', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      await bautajs.applyMiddlewares();

      const res = await supertest(bautajs.app)
        .get('/api/v1/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should not expose the endpoints that have been configured as private', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/private-operation-resolver.js'
        )
      });

      await bautajs.applyMiddlewares();

      const res = await supertest(bautajs.app).get('/api/v1/test');

      expect(res.status).toStrictEqual(404);
    });

    test('should not send the response again if already has been sent', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/operation-resolver-send-response.js'
        )
      });

      await bautajs.applyMiddlewares();

      const res = await supertest(bautajs.app)
        .get('/api/v1/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toStrictEqual({ ok: 'finished early' });
    });

    // eslint-disable-next-line jest/expect-expect
    test('should not send the response again if already has been sent on a readable pipe', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p.push(
                asPromise((_, ctx, _bautajs, callback) => {
                  const s = new Readable();
                  const expressResponse: Response = ctx.res as Response;
                  s.pipe(expressResponse);
                  ctx.res.set('Content-disposition', 'attachment; filename="file.pdf');

                  s.push('1');
                  s.push('2');
                  s.push('3');
                  s.push(null);

                  return s.on('end', callback);
                })
              )
            );
          })
        ]
      });

      await bautajs.applyMiddlewares();

      await supertest(bautajs.app)
        .get('/api/v1/test')
        .expect('Content-disposition', 'attachment; filename="file.pdf')
        .expect(200)
        .expect('123');
    });

    // eslint-disable-next-line jest/expect-expect
    test('should not force empty object if the status code is 204', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p.push((_, ctx) => {
                ctx.res.status(204);
              })
            );
          })
        ]
      });

      bautajs.applyMiddlewares();

      await supertest(bautajs.app).get('/api/v1/test').expect(204, '');
    });

    // eslint-disable-next-line jest/expect-expect
    test('should not override the headers set on the pipeline by the swagger ones', async () => {
      const form = new FormData();
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p.push(
                asPromise((_, ctx, _bautajs, callback) => {
                  const expressResponse: Response = ctx.res as Response;
                  form.append('part1', 'part 1 data');
                  form.append('part2', 'part 2 data');
                  ctx.res.set(
                    'Content-type',
                    `multipart/form-data; boundary=${form.getBoundary()}`
                  );
                  form.pipe(expressResponse);

                  return form.on('end', callback);
                })
              )
            );
          })
        ]
      });

      await bautajs.applyMiddlewares();

      await supertest(bautajs.app)
        .get('/api/v1/test')
        .expect('Content-type', `multipart/form-data; boundary=${form.getBoundary()}`)
        .expect(200);
    });

    test('should allow swagger 2.0', async () => {
      const bautajs = new BautaJSExpress(apiDefinitionsSwagger2, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      await bautajs.applyMiddlewares();

      const res = await supertest(bautajs.app)
        .get('/api/v1/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should return the swagger even if the openAPI swagger json has circular dependenciesw', async () => {
      const bautajs = new BautaJSExpress(apiDefinitionSwaggerCircularDeps, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      await bautajs.applyMiddlewares({ explorer: { enabled: true } });

      const res = await supertest(bautajs.app).get('/v1/openapi.json').expect(200);

      expect(res.status).toStrictEqual(200);
    });

    test('should not expose the swagger if explorer is set to false', async () => {
      const bautajs = new BautaJSExpress(apiDefinitionsSwagger2, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      await bautajs.applyMiddlewares({ explorer: { enabled: false } });

      const res = await supertest(bautajs.app).get('/v1/explorer').expect(404);

      expect(res.status).toStrictEqual(404);
    });

    test('should left error handling to express error handler', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/operation-resolver-error.js'
        )
      });

      await bautajs.applyMiddlewares();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      bautajs.app.use((err: any, _: any, res: any, _next: any) => {
        res.json({ message: err.message, status: res.statusCode }).end();
      });

      const res = await supertest(bautajs.app)
        .get('/api/v1/test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(res.body).toStrictEqual({ message: 'some error', status: 500 });
    });
  });
});
