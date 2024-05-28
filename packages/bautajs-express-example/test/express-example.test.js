import express from 'express';
import nock from 'nock';
import supertest from 'supertest';

import bautaJS from '../server/instances/bauta.js';

describe('bautajs-express-example regressions tests', () => {
  let app;
  beforeAll(async () => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
    app = express();

    const router = await bautaJS.buildRouter();

    app.use('/', router);
    // Set default error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
      res.json({ message: err.message, status: res.statusCode, errors: err.errors }).end();
    });
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('GET /api/articles should  return a successful response', async () => {
    nock('https://jsonplaceholder.typicode.com').get(`/posts`).reply(200);

    const res = await supertest(app).get('/api/articles');
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/chuckfacts/:string should return a successful response', async () => {
    const stringParam = 'foo';
    nock('https://api.chucknorris.io').get(`/jokes/search?query=${stringParam}`).reply(200);

    const res = await supertest(app).get(`/api/chuckfacts/${stringParam}`);
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/chuckfacts/:string should return a cached successful response', async () => {
    const stringParam = 'bar';
    nock('https://api.chucknorris.io')
      .get(`/jokes/search?query=${stringParam}`)
      .reply(200, { fact: 'foo' });

    const res = await supertest(app).get(`/api/chuckfacts/${stringParam}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ fact: 'foo' });
    expect(nock.isDone()).toBe(true);

    const res2 = await supertest(app).get(`/api/chuckfacts/${stringParam}`);
    expect(res2.statusCode).toBe(200);
    expect(res.body).toEqual({ fact: 'foo' });
  });

  test('GET api/cancel/:number should return a successful request for a number lower than 3', async () => {
    const res = await supertest(app).get(`/api/cancel/2`);
    expect(res.statusCode).toBe(200);
  });

  test('GET api/cancel/:number should return a server error response for a number higher than 3', async () => {
    const res = await supertest(app).get(`/api/cancel/4`);
    expect(res.statusCode).toBe(500);
  });

  test('minimap should create, get all and get by id successfully', async () => {
    const resPost1 = await supertest(app).post('/api/minimap').send({
      key: 'farewell',
      value: 'bye!'
    });
    expect(resPost1.statusCode).toBe(200);

    const resGetById = await supertest(app).get(`/api/minimap/farewell`);
    expect(resGetById.statusCode).toBe(200);
    expect(resGetById.body).toEqual({
      farewell: 'bye!'
    });

    const resPost2 = await supertest(app).post('/api/minimap').send({
      key: 'hi',
      value: 'hola!'
    });
    expect(resPost2.statusCode).toBe(200);

    const resGetAll = await supertest(app).get(`/api/minimap`);
    expect(resGetAll.statusCode).toBe(200);
    expect(resGetAll.body).toEqual({
      farewell: 'bye!',
      hi: 'hola!'
    });
  });

  test('GET /api/multiple-path/{key} should return a successful response', async () => {
    const res = await supertest(app).get(`/api/multiple-path/hola`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'This is the general text for requests and now we are receiving: hola'
    });
  });

  test('GET /api/multiple-path/specific should return a successful response', async () => {
    const res = await supertest(app).get(`/api/multiple-path/specific`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'This is a simple text for requests to the specific path'
    });
  });

  test('GET api/randomYear should return a successful response', async () => {
    nock('http://numbersapi.com').get('/random/year?json').reply(200);

    const res = await supertest(app).get(`/api/randomYear`);
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/randomYear should return a successful response', async () => {
    nock('http://numbersapi.com').get('/random/year?json').reply(200);

    const res = await supertest(app).get(`/api/randomYear2`);
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/factNumber/:number should return successful response', async () => {
    const stringParam = '100';
    nock('http://numbersapi.com').get(`/${stringParam}/math`).reply(200);

    const res = await supertest(app).get(`/api/factNumber/${stringParam}`);
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/factNumber2/:number should return successful response', async () => {
    const stringParam = '100';
    nock('http://numbersapi.com').get(`/${stringParam}/math`).reply(200);

    const res = await supertest(app).get(`/api/factNumber2/${stringParam}`);
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });
});
