import Fastify from 'fastify';
import { registerFastifyServer } from './registrator.js';

const fastify = Fastify({ logger: true });

(async () => {
  await registerFastifyServer(fastify);

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
