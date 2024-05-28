// eslint-disable-next-line no-unused-vars
import express, { Response } from 'express';
import path from 'path';
import FormData from 'form-data';
import supertest from 'supertest';
import { Readable } from 'stream';
import { resolver, asPromise, defaultLogger, Document } from '@axa/bautajs-core';
import { BautaJSExpress } from '../src/index.js';
import { getRequest, getResponse } from '../src/operators.js';

import apiDefinition from './fixtures/test-api-definitions.json';
import apiDefinitionV2 from './fixtures/test-api-definitions-v2.json';
import apiDefinitionSwagger2 from './fixtures/test-api-definitions-swagger-2.json';
import apiDefinitionSwaggerCircularDeps from './fixtures/test-api-definitions-swagger-circular-deps.json';
import apiDefinitionSwaggerPathOrdering from './fixtures/test-api-definitions-swagger-path-ordering.json';
import { getDirname } from './utils.js';
import { jest } from '@jest/globals';

describe('bautaJS express', () => {
  describe('request cancellation', () => {
    test('should trigger the aborted event when the client close the connection and log the error', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'error').mockImplementation(() => undefined);
      // @ts-ignore
      logger.child = () => logger;
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolvers: [
          operations => {
            operations.operation1.setup((_, ctx) => {
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
      app.use('/v1/', router);

      const request = supertest(app).get('/v1/api/test').set({ 'x-request-id': '1' });
      expect.assertions(1);
      try {
        await request;
      } catch (e) {
        expect(logger.error).toHaveBeenCalledWith(
          { message: 'Request was aborted by the requester intentionally' },
          'The request was canceled by the requester.'
        );
      }
    });
  });
  describe('express initialization', () => {
    test('should expose the given swagger with an express API', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolversPath: path.resolve(getDirname(), './fixtures/test-resolvers/operation-resolver.js')
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1/', router);

      const res = await supertest(app)
        .get('/v1/api/test')
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
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolversPath: path.resolve(
          getDirname(),
          './fixtures/test-resolvers/private-operation-resolver.js'
        )
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app).get('/v1/api/test');

      expect(res.status).toBe(404);
    });

    test('should not send the response again if already has been sent', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolvers: [
          operations => {
            operations.operation1.setup((_, ctx) => {
              const res = getResponse(ctx);
              res.json({ ok: 'finished early' });
            });
          }
        ]
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app)
        .get('/v1/api/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toStrictEqual({ ok: 'finished early' });
    });

    test('should not send the response again if already has been sent on a readable pipe', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(
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
      app.use('/v1', router);

      await supertest(app)
        .get('/v1/api/test')
        .expect('Content-disposition', 'attachment; filename="file.pdf')
        .expect(200)
        .expect('123');
    });

    test('should not force empty object if the status code is 204', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup((_, ctx) => {
              const res = getResponse(ctx);
              res.status(204);
            });
          })
        ]
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      await supertest(app).get('/v1/api/test').expect(204, '');
    });

    test('should not override the headers set on the pipeline by the swagger ones', async () => {
      const form = new FormData();
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(
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
      app.use('/v1', router);

      await supertest(app)
        .get('/v1/api/test')
        .expect('Content-type', `multipart/form-data; boundary=${form.getBoundary()}`)
        .expect(200);
    });

    test('should allow swagger 2.0', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinitionSwagger2 as Document,
        resolversPath: path.resolve(getDirname(), './fixtures/test-resolvers/operation-resolver.js')
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app)
        .get('/v1/api/test')
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
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinitionSwaggerCircularDeps as Document,
        resolversPath: path.resolve(getDirname(), './fixtures/test-resolvers/operation-resolver.js')
      });

      const router = await bautajs.buildRouter({ explorer: { enabled: true } });

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app).get('/v1/openapi.json').expect(200);

      expect(res.status).toBe(200);
    });

    test('should not expose the swagger if explorer is set to false', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinitionSwagger2,
        resolversPath: path.resolve(getDirname(), './fixtures/test-resolvers/operation-resolver.js')
      });

      const router = await bautajs.buildRouter({ explorer: { enabled: false } });

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app).get('/v1/explorer').expect(404);

      expect(res.status).toBe(404);
    });

    test('should left error handling to express error handler', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolversPath: path.resolve(
          getDirname(),
          './fixtures/test-resolvers/operation-resolver-error.js'
        )
      });
      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      app.use((err: any, _: any, res: any, _next: any) => {
        res.json({ message: err.message, status: res.statusCode }).end();
      });

      const res = await supertest(app)
        .get('/v1/api/test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(res.body).toStrictEqual({ message: 'some error', status: 500 });
    });
  });

  describe('two express instances', () => {
    test('should be possible to create two bautajs express instances and expose it in different paths', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinition as Document,
        resolversPath: path.resolve(getDirname(), './fixtures/test-resolvers/operation-resolver.js')
      });
      const bautajsV2 = new BautaJSExpress({
        apiDefinition: apiDefinitionV2 as Document,
        resolversPath: path.resolve(getDirname(), './fixtures/test-resolvers/operation-resolver.js')
      });

      const router = await bautajs.buildRouter();
      const routerV2 = await bautajsV2.buildRouter();

      const app = express();
      app.use('/v1', router);
      app.use('/v2', routerV2);

      const res = await supertest(app)
        .get('/v1/api/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);

      const resV2 = await supertest(app)
        .get('/v2/api/test')
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

  describe('path ordering', () => {
    test('should work with specific operation first in the resolver', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinitionSwaggerPathOrdering as Document,
        resolversPath: path.resolve(
          getDirname(),
          './fixtures/test-resolvers/path-ordering-specific-first-resolver.js'
        )
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const generalResponse = await supertest(app)
        .get('/v1/api/multiple-path/cat')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(generalResponse.body).toStrictEqual({
        message: 'This is the general text for requests and now we are receiving: cat'
      });

      const specificResponse = await supertest(app)
        .get('/v1/api/multiple-path/specific')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(specificResponse.body).toStrictEqual({
        message: 'This is a simple text for requests to the specific path'
      });
    });

    test('should work with general operation first in the resolver', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinitionSwaggerPathOrdering as Document,
        resolversPath: path.resolve(
          getDirname(),
          './fixtures/test-resolvers/path-ordering-general-first-resolver.js'
        )
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const generalResponse = await supertest(app)
        .get('/v1/api/multiple-path/cat')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(generalResponse.body).toStrictEqual({
        message: 'This is the general text for requests and now we are receiving: cat'
      });

      const specificResponse = await supertest(app)
        .get('/v1/api/multiple-path/specific')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(specificResponse.body).toStrictEqual({
        message: 'This is a simple text for requests to the specific path'
      });
    });
  });
});
