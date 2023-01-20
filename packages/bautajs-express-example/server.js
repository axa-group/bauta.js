const express = require('express');
const { notFound } = require('@hapi/boom');
const bautaJS = require('./server/instances/bauta');

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
    bautaJS.logger.info('Server listening on localhost: 3000');
  });
})();

process.on('unhandledRejection', () => {
  process.exit(1);
});
