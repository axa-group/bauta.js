import Fastify from 'fastify';

import { bautajsFastify } from '@axa/bautajs-fastify';
import { BautaJS } from '@axa/bautajs-core';

import apiDefinitionsV1 from './api-definitions-v1.json' assert { type: 'json' };

const fastify = Fastify({ logger: true });

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
