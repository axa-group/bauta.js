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
import { sessionFactory } from '../session-factory';

describe('session factory tests', () => {
  test('should return the request id and logger', () => {
    const req = { headers: {} };
    const result = sessionFactory(req);
    expect(typeof result.id).toStrictEqual('string');
    expect(typeof result.logger.info).toStrictEqual('function');
  });

  test('should return the request id, the logger and the userId with the user token encripted in case of an Authenticated request', () => {
    const req = {
      headers: {
        authorization: 'Bearer aaabbbccc'
      }
    };
    const result = sessionFactory(req);
    expect(typeof result.userId).toStrictEqual('string');
  });

  test('should use the request-id header in case that exists as req.id', () => {
    const req = {
      headers: {
        authorization: 'Bearer aaabbbccc',
        'request-id': '1234'
      }
    };
    const result = sessionFactory(req);
    expect(result.id).toStrictEqual('1234');
  });
});
