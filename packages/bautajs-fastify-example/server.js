const fastify = require('fastify')({ logger: true });

const { registerFastifyServer } = require('./registrator');

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
