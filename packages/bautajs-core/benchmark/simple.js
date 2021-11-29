const http = require('http');
const stringify = require('fast-safe-stringify');
const { BautaJS, resolver, pipe } = require('../dist/index');

const apiDefinition = {
  openapi: '3.0.0',
  info: {
    version: 'v1',
    title: 'test'
  },
  servers: [
    {
      url: 'v1/api'
    }
  ],
  paths: {
    '/': {
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

const bautajs = new BautaJS({
  apiDefinition,
  resolvers: [
    resolver(operations => {
      operations.operation1.setup(pipe(() => ({ hello: 'world' })));
    })
  ]
});

(async () => {
  await bautajs.bootstrap();
  http
    .createServer(async (req, res) => {
      const response = await bautajs.operations.operation1.run({ req, res });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(stringify(response));
      res.end();
    })
    .listen(3000);
})();
