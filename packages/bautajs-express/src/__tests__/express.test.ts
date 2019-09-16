/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
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
import path from 'path';
import supertest from 'supertest';
import { Readable } from 'stream';
import { Response } from 'express';
import { resolver, asPromise } from '@bautajs/core';
import { BautaJSExpress } from '../index';

const apiDefinitions = require('./fixtures/test-api-definitions.json');
const apiDefinitionsSwagger2 = require('./fixtures/test-api-definitions-swagger-2.json');

describe('BautaJS express', () => {
  test('Should expose the given swagger with an express API', done => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    bautajs.applyMiddlewares();

    supertest(bautajs.app)
      .get('/api/v1/test')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.body).toEqual([
          {
            id: 134,
            name: 'pet2'
          }
        ]);
        done();
      });
  });

  test('Should not expose the endpoints that have been configured as private', done => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/private-operation-resolver.js'
      )
    });

    bautajs.applyMiddlewares();

    supertest(bautajs.app)
      .get('/api/v1/test')
      .expect(404)
      .end(err => {
        if (err) throw err;
        done();
      });
  });

  test('Should not send the response again if already has been sent', done => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-send-response.js'
      )
    });

    bautajs.applyMiddlewares();

    supertest(bautajs.app)
      .get('/api/v1/test')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.body).toEqual({ ok: 'finished early' });
        done();
      });
  });

  test('Should not send the response again if already has been sent on a readable pipe', done => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.setup(p =>
            p.push(
              asPromise((_, ctx, _bautajs, callback) => {
                const s = new Readable();
                const expressResponse: Response = ctx.res as Response;
                s.pipe(expressResponse);
                ctx.res.set('Content-disposition', 'attachment; filename="file.pdf');

                s.push('1');
                s.push('2');
                s.push('3');
                s.push(null);

                return s.on('end', callback);
              })
            )
          );
        })
      ]
    });

    bautajs.applyMiddlewares();

    supertest(bautajs.app)
      .get('/api/v1/test')
      .expect('Content-disposition', 'attachment; filename="file.pdf')
      .expect(200)
      .expect('123')
      .end(done);
  });

  test('Should allow swagger 2.0', done => {
    const bautajs = new BautaJSExpress(apiDefinitionsSwagger2, {
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    bautajs.applyMiddlewares();

    supertest(bautajs.app)
      .get('/api/v1/test')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.body).toEqual([
          {
            id: 134,
            name: 'pet2'
          }
        ]);
        done();
      });
  });

  test('Should not expose the swagger if explorer is set to false', done => {
    const bautajs = new BautaJSExpress(apiDefinitionsSwagger2, {
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    bautajs.applyMiddlewares({ explorer: { enabled: false } });

    supertest(bautajs.app)
      .get('/v1/explorer')
      .expect(404)
      .end((err, res) => {
        if (err) throw err;
        expect(res.status).toEqual(404);
        done();
      });
  });

  test('Should left error handling to express error handler', done => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-error.js'
      )
    });

    bautajs.applyMiddlewares();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bautajs.app.use((err: any, _: any, res: any, _next: any) => {
      res.json({ message: err.message, status: res.statusCode }).end();
    });

    supertest(bautajs.app)
      .get('/api/v1/test')
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        if (err) throw err;
        expect(res.body).toEqual({ message: 'some error', status: 500 });
        done();
      });
  });
});
