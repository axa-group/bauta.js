const fastify = require('fastify')({
  logger: {
    level: 'debug'
  }
});
const { bautajsFastify } = require('../../dist/index');
const apiDefinition = require('./api-definition.json');

// By default fastify logger will be used.
fastify.register(bautajsFastify, {
  apiDefinition,
  resolversPath: './examples/simple-usage/resolvers/**/*resolver.js',
  staticConfig: {
    someVar: 2
  },
  apiBasePath: '/api/',
  prefix: '/v1/'
});

// Fastify allows async await style. await fastify.listen(3000);
fastify.listen(3000, err => {
  if (err) throw err;
});
