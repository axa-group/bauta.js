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
import { BautaJS, Document } from '@bautajs/core';
import testDatasource from './fixtures/test-datasource-dynamic';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('compile datasource decorator', () => {
  let bautajs: BautaJS;
  const path = 'cats';
  beforeEach(() => {
    nock('https://google.com')
      .get(`/${path}`)
      .reply(200, [{ id: 3, name: 'pet3' }]);

    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should compile de datasource and do the request to a dynamic url', async () => {
    bautajs.operations.v1.operation1.setup(p => {
      p.push((_, ctx) => {
        ctx.data.path = path;
      }).push(
        testDatasource.operation1.compile((_, _ctx, _bautajs, provider) => {
          return provider.request({ resolveBodyOnly: true });
        })
      );
    });

    expect(await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} })).toStrictEqual([
      { id: 3, name: 'pet3' }
    ]);
  });
});
