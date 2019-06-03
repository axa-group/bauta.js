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
/* global expect, describe, test */
import fs from 'fs';
import path from 'path';
import { Multipart, MultipartBody, RequestPart } from '../index';

describe('Multipart request', () => {
  test('Should build a new multipart request if the multipart options is set', async () => {
    const multipart = new Multipart({
      preambleCRLF: true,
      postambleCRLF: true
    });
    const multipartBody: MultipartBody = {
      chunked: false,
      data: [
        {
          'content-type': 'application/json',
          body: JSON.stringify({
            foo: 'bar',
            _attachments: {
              'message.txt': {
                follows: true,
                length: 18,
                content_type: 'text/plain'
              }
            }
          })
        },
        { body: 'I am an attachment' },
        {
          body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json'))
        }
      ]
    };

    const { body, headers } = multipart.buildRequest(multipartBody);
    const stringifyedBody = JSON.stringify(body);
    expect(stringifyedBody).toContain('message.txt');
    expect(stringifyedBody).toContain('I am an attachment');
    expect(stringifyedBody).toContain('fixtures/test-schema.json');
    expect(headers && headers['transfer-encoding']).toEqual('chunked');
    expect(headers && headers['content-type']).toContain('multipart/related');
  });

  test('Should build a new multipart request if multipart do not have data object', async () => {
    const multipart = new Multipart({
      preambleCRLF: true,
      postambleCRLF: true
    });
    const multipartBody: RequestPart[] = [
      {
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          foo: 'bar',
          _attachments: {
            'message.txt': {
              follows: true,
              length: 18,
              content_type: 'text/plain'
            }
          }
        })
      },
      { body: 'I am an attachment' },
      {
        body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json'))
      }
    ];
    const { body, headers } = multipart.buildRequest(multipartBody);

    const stringifyedBody = JSON.stringify(body);
    expect(stringifyedBody).toContain('message.txt');
    expect(stringifyedBody).toContain('I am an attachment');
    expect(stringifyedBody).toContain('test-schema.json');
    expect(headers && headers['transfer-encoding']).toEqual('chunked');
    expect(headers && headers['content-type']).toContain('multipart/related');
  });
});
