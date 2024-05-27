const fastify = require('fastify')({ logger: true });

const { bautajsFastify } = require('@axa/bautajs-fastify');
const { BautaJS } = require('@axa/bautajs-core');

const apiDefinitionsV1 = require('./api-definitions-v1.json');

const bautaJsV1 = new BautaJS({
  apiDefinition: apiDefinitionsV1,
  resolversPath: './server/**/resolvers*.js',
  staticConfig: {
    someVar: 2
  },
  strictResponseSerialization: false,
  validatorOptions: {
    coerceTypes: 'array'
  }
});

(async () => {
  fastify.register(bautajsFastify, {
    bautajsInstance: bautaJsV1,
    prefix: '/v1/',
    apiBasePath: '/api/'
  });

  fastify.listen(
    {
      host: '0.0.0.0',
      port: 8080
    },
    err => {
      if (err) throw err;
      fastify.log.info('Server listening on localhost:', fastify.server.address().port);
    }
  );
})();
