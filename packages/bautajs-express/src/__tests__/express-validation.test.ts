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
// eslint-disable-next-line no-unused-vars
import express from 'express';
import path from 'path';
import supertest from 'supertest';
import { BautaJSExpress } from '../index';

const apiDefinitionsCustomValidation = require('./fixtures/test-api-definitions-custom-validation.json');

describe('bautaJS express validation tests', () => {
  test('should validate the request with the bautajs validator adding a custom format', async () => {
    const bautajs = new BautaJSExpress(apiDefinitionsCustomValidation, {
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    const router = await bautajs.buildRouter();

    const app = express();
    app.use(router);
    // Set default error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _: any, res: any, _next: any) => {
      res.json({ message: err.message, status: res.statusCode, errors: err.errors }).end();
    });

    const res = await supertest(app)
      .get('/api/v1/test')
      .query({ limit: 123 })
      .expect('Content-Type', /json/)
      .expect(422);

    expect(res.body.message).toStrictEqual(`The request was not valid`);
    expect(res.body.errors[0]).toStrictEqual({
      path: '.limit',
      location: 'query',
      message: 'should match format "test"',
      errorCode: 'format'
    });
  });

  test('should validate the response with the bautajs validator adding a custom format', async () => {
    const bautajs = new BautaJSExpress(apiDefinitionsCustomValidation, {
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      )
    });

    const router = await bautajs.buildRouter();

    const app = express();
    app.use(router);
    // Set default error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _: any, res: any, _next: any) => {
      res.json({ message: err.message, status: res.statusCode, errors: err.errors }).end();
    });

    const res = await supertest(app).get('/api/v1/test').expect('Content-Type', /json/).expect(500);

    expect(res.body.message).toStrictEqual(`Internal error`);
  });
});
