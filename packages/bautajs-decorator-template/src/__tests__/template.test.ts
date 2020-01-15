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
import { BautaJS, Document } from '@bautajs/core';
import { template } from '../index';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('template decorator', () => {
  test('should allow put a template', async () => {
    const bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    bautajs.operations.v1.operation1.setup(p => {
      p.push(() => '1').push(template([{ id: '{{ctx.req.id}}', name: '{{previousValue}}' }]));
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { id: 1, query: {} }, res: {} })
    ).toStrictEqual([{ id: 1, name: '1' }]);
  });

  test('should bypass not valid template', async () => {
    const bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
      p.push(() => '1').push(template(undefined));
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { id: 1, query: {} }, res: {} })
    ).toBeUndefined();
  });
});
