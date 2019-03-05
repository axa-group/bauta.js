/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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
/* global expect, describe, test */
const request = require('supertest');
const path = require('path');
const apiDefinitions = require('../fixtures/test-api-definitions.json');

const BautaJSExpress = require('../../bauta-express');

describe('BautaJS express', () => {
  test('Should expose the given swagger with an express API', done => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
      resolversPath: path.resolve(
        __dirname,
        '../fixtures/test-resolvers/test-operation-resolver.js'
      )
    });

    bautajs.applyMiddlewares();

    request(bautajs.app)
      .get('/api/v1/test')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.body).toEqual({ ok: 'benderTest' });
        done();
      });
  });

  test('Should not expose the endpoints that have the dataSource in private mode', done => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource-private.json'),
      resolversPath: path.resolve(
        __dirname,
        '../fixtures/test-resolvers/test-operation-resolver.js'
      )
    });

    bautajs.applyMiddlewares();

    request(bautajs.app)
      .get('/api/v1/test')
      .expect(404)
      .end(err => {
        if (err) throw err;
        done();
      });
  });
});
