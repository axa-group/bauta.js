/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import nock from 'nock';
import { BautaJS, Document } from '@bautajs/core/src';
import testDatasource from './fixtures/test-datasource';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('request decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    nock('https://google.com')
      .get('/')
      .reply(200, [{ id: 3, name: 'pet3' }]);

    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should do a request and get the full response if resolveBodyOnly is false', async () => {
    bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
      p.push(testDatasource.operation1({ resolveBodyOnly: false }));
    });

    const response = await bautajs.operations.v1.operation1.run({
      req: { id: 1 },
      res: { statusCode: 200 }
    });

    expect(response.body).toStrictEqual([{ id: 3, name: 'pet3' }]);
  });

  test('should do a request', async () => {
    bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
      p.push(testDatasource.operation1());
    });

    expect(await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} })).toStrictEqual([
      { id: 3, name: 'pet3' }
    ]);
  });
});
