const fastify = require('fastify')({
  logger: {
    level: 'debug'
  }
});
const { BautaJS } = require('@axa-group/bautajs-core/dist');
// It should be require('@axa-group/bautajs-fastify')
const { bautajsFastify } = require('../../dist/index');
const apiDefinition = require('./api-definition.json');

// By default fastify logger will be used.
const bautajsV1 = new BautaJS({
  logger: fastify.log,
  apiDefinition,
  resolversPath: './examples/simple-usage/resolvers/v1/**/*resolver.js',
  staticConfig: {
    someVar: 2
  }
});
fastify
  .register(bautajsFastify, {
    bautajsInstance: bautajsV1,
    apiBasePath: '/api/',
    prefix: '/v1/'
  })
  .after(() => {
    const bautajsV2 = new BautaJS({
      logger: fastify.log,
      apiDefinition,
      resolversPath: './examples/simple-usage/resolvers/v2/**/*resolver.js',
      staticConfig: {
        someVar: 2
      }
    });
    bautajsV2.inheritOperationsFrom(bautajsV1);
    fastify.register(bautajsFastify, {
      bautajsInstance: bautajsV2,
      apiBasePath: '/api/',
      prefix: '/v2/'
    });
  });

// Fastify allows async await style. await fastify.listen(3000);
fastify.listen(3000, err => {
  if (err) throw err;
});
