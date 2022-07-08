const fastify = require('fastify')();
const { resolver, pipe } = require('@bautajs/core');
const { bautajsFastify } = require('../dist/index');

const apiDefinition = {
  openapi: '3.0.0',
  info: {
    version: 'v1',
    title: 'test'
  },
  servers: [
    {
      url: '/v1/api/'
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

fastify.register(bautajsFastify, {
  apiDefinition,
  resolvers: [
    resolver(operations => {
      operations.operation1.setup(pipe(() => ({ hello: 'world' })));
    })
  ]
});

(async () => {
  fastify.listen(3000, err => {
    if (err) throw err;
    console.info('Server listening on localhost:', fastify.server.address().port);
  });
})();
