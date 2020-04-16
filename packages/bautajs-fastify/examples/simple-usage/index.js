const fastify = require('fastify')({
  logger: {
    level: 'debug'
  }
});
const { bautajsFastify } = require('../../dist/index');
const apiDefinitions = require('./api-definition.json');

// By default fastify logger will be used.
fastify.register(bautajsFastify, {
  apiDefinitions,
  resolversPath: './examples/simple-usage/resolvers/**/*resolver.js',
  staticConfig: {
    someVar: 2
  }
});

// Fastify allows async await style. await fastify.listen(3000);
fastify.listen(3000, err => {
  if (err) throw err;
  fastify.log.info('Server listenting on localhost:', fastify.server.address().port);
});
