import express from 'express';
import { notFound } from '@hapi/boom';
import bautaJS from './server/instances/bauta.js';

(async () => {
  // Please, add helmet or other security library on your production API.
  const app = express();

  const router = await bautaJS.buildRouter();

  app.use('/', router);

  /* Error handler */
  // 404 error
  app.use((req, res, next) => next(notFound()));
  // Error handler
  /* eslint-disable-next-line */
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res
      .status(err.output ? err.output.statusCode : err.status || 500)
      .json(err.errors || { message: err.message });
  });

  app.listen(8080, err => {
    if (err) throw err;
    bautaJS.logger.info('Server listening on localhost: 8080');
  });
})();

process.on('unhandledRejection', () => {
  process.exit(1);
});
