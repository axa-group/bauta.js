// eslint-disable-next-line no-unused-vars

import split from 'split2';
import pino from 'pino';
import supertest from 'supertest';
import { resolver, defaultLogger } from '@axa/bautajs-core';
import express from 'express';
import { BautaJSExpress } from '../index';

const apiDefinitionExtraTag = require('./fixtures/test-api-definitions-extra-tag.json');
const apiDefinition = require('./fixtures/test-api-unused-definitions.json');
const expectedFullSwagger = require('./fixtures/expected-api-full-unused-swagger.json');
const expectedUnusedSwagger = require('./fixtures/expected-api-unused-swagger.json');
const expectedOnlyTagsSwagger = require('./fixtures/expected-api-only-used-tags-swagger.json');

describe('express middlewares', () => {
  describe('express explorer', () => {
    test('should exposes all endpoints that has a resolver', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
            operations.unused.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
          })
        ]
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app)
        .get('/v1/openapi.json')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200);

      expect(JSON.parse(res.text)).toStrictEqual(expectedFullSwagger);
    });

    test('should not expose the endpoint if there is no resolver for it', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
          })
        ]
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app)
        .get('/v1/openapi.json')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200);

      expect(JSON.parse(res.text)).toStrictEqual(expectedUnusedSwagger);
    });

    test('should only show the tags that are in the exposed routes', async () => {
      const bautajs = new BautaJSExpress({
        apiDefinition: apiDefinitionExtraTag,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
          })
        ]
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      const res = await supertest(app)
        .get('/v1/openapi.json')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200);

      expect(JSON.parse(res.text)).toStrictEqual(expectedOnlyTagsSwagger);
    });
  });

  describe('express pino logger', () => {
    test('pino logger can be disabled', async () => {
      const logger = defaultLogger();
      logger.child = () => {
        return logger;
      };
      const spy = jest.spyOn(logger, 'info');
      const bautajs = new BautaJSExpress({
        logger,
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
            operations.unused.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
          })
        ]
      });

      const router = await bautajs.buildRouter({
        expressPino: {
          enabled: false
        }
      });

      const app = express();
      app.use('/v1', router);

      await supertest(app).get('/v1/api/test').expect('Content-Type', /json/).expect(200);

      expect(spy).not.toHaveBeenCalledWith(expect.objectContaining({ msg: 'incoming request' }));
    });

    test('incoming request must be logged with pino express', async () => {
      const logger = defaultLogger();
      logger.child = () => {
        return logger;
      };
      const spy = jest.spyOn(logger, 'info');
      const bautajs = new BautaJSExpress({
        logger,
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
            operations.unused.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
          })
        ]
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);

      await supertest(app).get('/v1/api/test').expect('Content-Type', /json/).expect(200);

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ msg: 'incoming request' }));
    });
    test('pino express serializers can be overridden', async () => {
      const dest = split(JSON.parse);

      const logger = pino(dest);
      const bautajs = new BautaJSExpress({
        logger,
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
            operations.unused.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
          })
        ]
      });

      const router = await bautajs.buildRouter({
        expressPino: {
          enabled: true,
          options: {
            serializers: {
              req: () => ({
                customProperty: 'custom'
              })
            }
          }
        }
      });

      const app = express();
      app.use('/v1', router);
      let reqLog = {};
      dest.on('data', (line: any) => {
        if (line.req) {
          reqLog = line.req;
        }
      });

      await supertest(app).get('/v1/api/test').expect('Content-Type', /json/).expect(200);
      expect(reqLog).toStrictEqual(expect.objectContaining({ customProperty: 'custom' }));
    });

    test('pino express request serializer should print url, method and query params', async () => {
      const dest = split(JSON.parse);

      const logger = pino(dest);
      const bautajs = new BautaJSExpress({
        logger,
        apiDefinition,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
            operations.unused.setup(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ]);
          })
        ]
      });

      const router = await bautajs.buildRouter();

      const app = express();
      app.use('/v1', router);
      let reqLog = {};
      dest.on('data', (line: any) => {
        if (line.req) {
          reqLog = line.req;
        }
      });

      await supertest(app).get('/v1/api/test?test=1').expect('Content-Type', /json/).expect(200);
      expect(reqLog).toStrictEqual(
        expect.objectContaining({ method: 'GET', url: '/v1/api/test', query: { test: '1' } })
      );
    });
  });
});
