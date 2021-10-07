const { bautajsFastify } = require('@bautajs/fastify');
const path = require('path');
const apiDefinition = require('../movies-api.json');

module.exports = (fastify, options, next) => {
  fastify.register(bautajsFastify, {
    apiDefinition,
    resolversPath: path.resolve(__dirname, 'resolvers/**/*.js')
  });

  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.status(error.statusCode || 500).send({
      message: error.message || error.response?.body?.status_message,
      statusCode: error.statusCode
    });
  });

  next();
};
