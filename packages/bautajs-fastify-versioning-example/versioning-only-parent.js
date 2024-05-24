const fastify = require('fastify')({ logger: true });

const { bautajsFastify } = require('@axa/bautajs-fastify');
const { BautaJS } = require('@axa/bautajs-core');

const apiDefinitionsV1 = require('./api-definitions-v1.json');

const apiDefinitionsV2 = require('./api-definitions-v2.json');

const bautaJsV1 = new BautaJS({
  apiDefinition: apiDefinitionsV1,
  resolversPath: './server/v1/resolvers.js',
  staticConfig: {
    someVar: 2
  },
  strictResponseSerialization: false,
  validatorOptions: {
    coerceTypes: 'array'
  }
});

(async () => {
  fastify
    .register(bautajsFastify, {
      bautajsInstance: bautaJsV1,
      prefix: '/v1/',
      apiBasePath: '/api/'
    })
    .after(() => {
      fastify.register(bautajsFastify, {
        resolversPath: './server/v2/resolvers.js',
        apiDefinition: apiDefinitionsV2,
        prefix: '/v2/',
        apiBasePath: '/api/',
        inheritOperationsFrom: bautaJsV1
      });
    });

  fastify.listen(
    {
      host: '0.0.0.0',
      port: 8383
    },
    err => {
      if (err) throw err;
      fastify.log.info('Server listening on localhost:', fastify.server.address().port);
    }
  );
})();
