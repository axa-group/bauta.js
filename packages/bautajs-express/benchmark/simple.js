const { resolver, pipe } = require('@bautajs/core');
const express = require('express');
const { BautaJSExpress } = require('../dist/index');

const apiDefinition = {
  openapi: '3.0.0',
  info: {
    version: 'v1',
    title: 'test'
  },
  servers: [
    {
      url: '/api/'
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

const app = express();

const bautaJSExpress = new BautaJSExpress({
  apiDefinition,
  resolvers: [
    resolver(operations => {
      operations.operation1.setup(pipe(() => ({ hello: 'world' })));
    })
  ]
});

(async () => {
  const router = await bautaJSExpress.buildRouter();

  app.use('/', router);

  app.listen(3000, err => {
    if (err) throw err;
    bautaJSExpress.logger.info('Server listening on localhost: 8080');
  });
})();
