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
import express, { Response } from 'express';
import path from 'path';
import FormData from 'form-data';
import supertest from 'supertest';
import { Readable } from 'stream';
import { resolver, asPromise, defaultLogger } from '@bautajs/core';
import { BautaJSExpress } from '../index';
import { getRequest, getResponse } from '../operators';

const apiDefinitions = require('./fixtures/test-api-definitions.json');
const apiDefinitionsV2 = require('./fixtures/test-api-definitions-v2.json');
const apiDefinitionsSwagger2 = require('./fixtures/test-api-definitions-swagger-2.json');
const apiDefinitionSwaggerCircularDeps = require('./fixtures/test-api-definitions-swagger-circular-deps.json');

describe('bautaJS express', () => {
  describe('request cancellation', () => {
    test('should trigger the aborted event when the client close the connection and log the error', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'error').mockImplementation();
      logger.child = () => logger;
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolvers: [
          operations => {
            operations.v1.operation1.setup((_, ctx) => {
              const req = getRequest(ctx);
              req.socket.destroy();

              return new Promise(resolve => setTimeout(() => resolve({ result: 'ok' }), 500));
            });
          }
        ],
        logger
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      const request = supertest(app).get('/api/v1/test').set({ 'x-request-id': '1' });
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

      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      const res = await supertest(app)
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

      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      const res = await supertest(app).get('/api/v1/test');

      expect(res.status).toStrictEqual(404);
    });

    test('should not send the response again if already has been sent', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/operation-resolver-send-response.js'
        )
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      const res = await supertest(app)
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
            operations.v1.operation1.setup(
              asPromise((_, ctx, _bautajs, callback) => {
                const res = getResponse(ctx);
                const s = new Readable();
                const expressResponse: Response = res;
                s.pipe(expressResponse);
                res.set('Content-disposition', 'attachment; filename="file.pdf');

                s.push('1');
                s.push('2');
                s.push('3');
                s.push(null);

                return s.on('end', callback);
              })
            );
          })
        ]
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      await supertest(app)
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
            operations.v1.operation1.setup((_, ctx) => {
              const res = getResponse(ctx);
              res.status(204);
            });
          })
        ]
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      await supertest(app).get('/api/v1/test').expect(204, '');
    });

    // eslint-disable-next-line jest/expect-expect
    test('should not override the headers set on the pipeline by the swagger ones', async () => {
      const form = new FormData();
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(
              asPromise((_, ctx, _bautajs, callback) => {
                const res = getResponse(ctx);
                form.append('part1', 'part 1 data');
                form.append('part2', 'part 2 data');
                res.set('Content-type', `multipart/form-data; boundary=${form.getBoundary()}`);
                form.pipe(res);

                return form.on('end', callback);
              })
            );
          })
        ]
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      await supertest(app)
        .get('/api/v1/test')
        .expect('Content-type', `multipart/form-data; boundary=${form.getBoundary()}`)
        .expect(200);
    });

    test('should allow swagger 2.0', async () => {
      const bautajs = new BautaJSExpress(apiDefinitionsSwagger2, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      const res = await supertest(app)
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

      const router = await bautajs.buildRouter({ explorer: { enabled: true } });

      const app = express();
      app.use(router);

      const res = await supertest(app).get('/v1/openapi.json').expect(200);

      expect(res.status).toStrictEqual(200);
    });

    test('should not expose the swagger if explorer is set to false', async () => {
      const bautajs = new BautaJSExpress(apiDefinitionsSwagger2, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const router = await bautajs.buildRouter({ explorer: { enabled: false } });

      const app = express();
      app.use(router);

      const res = await supertest(app).get('/v1/explorer').expect(404);

      expect(res.status).toStrictEqual(404);
    });

    test('should left error handling to express error handler', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/operation-resolver-error.js'
        )
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use(router);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      app.use((err: any, _: any, res: any, _next: any) => {
        res.json({ message: err.message, status: res.statusCode }).end();
      });

      const res = await supertest(app)
        .get('/api/v1/test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(res.body).toStrictEqual({ message: 'some error', status: 500 });
    });
  });

  describe('two express instances', () => {
    test('should be possible to create two bautajs express instances and expose it in different paths', async () => {
      const bautajs = new BautaJSExpress(apiDefinitions, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });
      const bautajsV2 = new BautaJSExpress(apiDefinitionsV2, {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      const router = await bautajs.buildRouter();
      const routerV2 = await bautajsV2.buildRouter();

      const app = express();
      app.use(router);
      app.use(routerV2);

      const res = await supertest(app)
        .get('/api/v1/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);

      const resV2 = await supertest(app)
        .get('/api/v2/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(resV2.body).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });
  });
});
