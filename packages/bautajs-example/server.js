/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const express = require('express');
const { notFound } = require('@hapi/boom');
const bautaJS = require('./server/instances/bauta');

(async () => {
  const app = express();

  const router = await bautaJS.buildRouter();

  app.use('/v1/', router);

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

  app.listen(3000, err => {
    if (err) throw err;
    bautaJS.logger.info('Server listening on localhost: 3000');
  });
})();

process.on('unhandledRejection', () => {
  process.exit(1);
});
