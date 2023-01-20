const { bautajsFastify, logger } = require('@axa/bautajs-fastify');
const apiDefinition = require('./api-definition.json');
const { logRequest } = require('./server/hooks/logger-hook');

async function registerFastifyServer(fastify) {
  fastify.addHook('onRequest', logRequest);

  fastify
    .register(bautajsFastify, {
      apiDefinition,
      prefix: '/api/',
      apiBasePath: '/',
      resolversPath: './server/resolvers/**/*.js',
      staticConfig: {
        someVar: 2
      },
      strictResponseSerialization: false
    })
    .after(err => {
      if (err) {
        logger.error(err, 'Error on fastify server');
        throw err;
      }
    });
}

module.exports = {
  registerFastifyServer
};
