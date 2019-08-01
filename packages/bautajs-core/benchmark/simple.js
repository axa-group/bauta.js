const http = require('http');
const stringify = require('fast-safe-stringify');
const { BautaJS, resolver } = require('../dist/index');

const apiDefinitions = [
  {
    openapi: '3',
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
            '200': {
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
  }
];

const bautajs = new BautaJS(apiDefinitions, {
  resolvers: [
    resolver(operations => {
      operations.v1.operation1.setup(p => p.push(() => ({ hello: 'world' })));
    })
  ]
});

http
  .createServer(async (req, res) => {
    const response = await bautajs.operations.v1.operation1.run({ req, res });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(stringify(response));
    res.end();
  })
  .listen(8080);
