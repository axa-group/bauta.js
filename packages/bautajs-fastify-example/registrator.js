import { bautajsFastify } from '@axa/bautajs-fastify';
import apiDefinition from './api-definition.json' assert { type: 'json' };
import { logRequest } from './server/hooks/logger-hook.js';

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
      strictResponseSerialization: false,
      validatorOptions: {
        coerceTypes: 'array'
      }
    })
    .after(err => {
      if (err) {
        console.log(err, 'Error on fastify server');
        throw err;
      }
    });
}

export { registerFastifyServer };
