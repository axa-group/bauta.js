const Fastify = require('fastify');
const nock = require('nock');
const qs = require('qs');

const { registerFastifyServer } = require('../registrator');

describe('bautajs-fastify-example regressions tests', () => {
  let fastify;
  beforeAll(async () => {
    nock.disableNetConnect();
    fastify = Fastify({ logger: true });
    await registerFastifyServer(fastify);
  });

  afterEach(() => {});

  afterAll(() => {
    nock.enableNetConnect();
    nock.cleanAll();
    fastify.close();
  });

  test('GET /api/articles should  return a successful response', async () => {
    nock('https://jsonplaceholder.typicode.com').get(`/posts`).reply(200);

    const res = await fastify.inject({
      method: 'GET',
      url: '/api/articles'
    });
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/chuckfacts/:string should return a successful response', async () => {
    const stringParam = 'foo';
    nock('https://api.chucknorris.io').get(`/jokes/search?query=${stringParam}`).reply(200);

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/chuckfacts/${stringParam}`
    });
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/chuckfacts/:string should return a cached successful response', async () => {
    const stringParam = 'bar';
    nock('https://api.chucknorris.io')
      .get(`/jokes/search?query=${stringParam}`)
      .reply(200, { fact: 'foo' });

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/chuckfacts/${stringParam}`
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ fact: 'foo' });
    expect(nock.isDone()).toBe(true);

    const res2 = await fastify.inject({
      method: 'GET',
      url: `/api/chuckfacts/${stringParam}`
    });
    expect(res2.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ fact: 'foo' });
  });

  test('GET api/cancel/:number should return a successful request for a number lower than 3', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/cancel/2`
    });
    expect(res.statusCode).toBe(200);
  });

  test('GET api/cancel/:number should return a server error response for a number higher than 3', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/cancel/4`
    });
    expect(res.statusCode).toBe(500);
  });

  test('minimap should create, get all and get by id successfully', async () => {
    const resPost1 = await fastify.inject({
      method: 'POST',
      url: `/api/minimap`,
      body: {
        key: 'farewell',
        value: 'bye!'
      }
    });
    expect(resPost1.statusCode).toBe(200);

    const resGetById = await fastify.inject({
      method: 'GET',
      url: `/api/minimap/farewell`
    });
    expect(resGetById.statusCode).toBe(200);
    expect(JSON.parse(resGetById.body)).toEqual({
      farewell: 'bye!'
    });

    const resPost2 = await fastify.inject({
      method: 'POST',
      url: `/api/minimap`,
      body: {
        key: 'hi',
        value: 'hola!'
      }
    });
    expect(resPost2.statusCode).toBe(200);

    const resGetAll = await fastify.inject({
      method: 'GET',
      url: `/api/minimap`
    });
    expect(resGetAll.statusCode).toBe(200);
    expect(JSON.parse(resGetAll.body)).toEqual({
      farewell: 'bye!',
      hi: 'hola!'
    });
  });

  test('GET /api/multiple-path/{key} should return a successful response', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/multiple-path/hola`
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      message: 'This is the general text for requests and now we are receiving: hola'
    });
  });

  test('GET /api/multiple-path/specific should return a successful response', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/multiple-path/specific`
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      message: 'This is a simple text for requests to the specific path'
    });
  });

  test('GET api/randomYear should return a successful response', async () => {
    nock('http://numbersapi.com').get('/random/year?json').reply(200);

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/randomYear`
    });
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/randomYear should return a successful response', async () => {
    nock('http://numbersapi.com').get('/random/year?json').reply(200);

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/randomYear2`
    });
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/factNumber/:number should return successful response', async () => {
    const stringParam = '100';
    nock('http://numbersapi.com').get(`/${stringParam}/math`).reply(200);

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/factNumber/${stringParam}`
    });
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/factNumber2/:number should return successful response', async () => {
    const stringParam = '100';
    nock('http://numbersapi.com').get(`/${stringParam}/math`).reply(200);

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/factNumber2/${stringParam}`
    });
    expect(res.statusCode).toBe(200);
    expect(nock.isDone()).toBe(true);
  });

  test('GET api/array-query-param should work even with a single element', async () => {
    const chickenId = 'elliot';

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/array-query-param?chickenIds=${chickenId}`
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      message: `This is the general text for requests and now we are receiving: ["${chickenId}"]`
    });
  });

  test('GET api/array-query-param-csv is not capable of parsing comma separated values with default node query string parser', async () => {
    const chickenId = 'elliot';
    const chickenId2 = 'jeanne';

    const res = await fastify.inject({
      method: 'GET',
      url: `/api/array-query-param?chickenIds=${chickenId},${chickenId2}`
    });
    expect(res.statusCode).toBe(200);
    // Note here that we are not parsing both ids as a TWO elements but we are parsing everything as a single element
    expect(JSON.parse(res.body)).toEqual({
      message: `This is the general text for requests and now we are receiving: ["${chickenId},${chickenId2}"]`
    });
  });
});
