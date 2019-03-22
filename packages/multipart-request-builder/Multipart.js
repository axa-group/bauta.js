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
const uuid = require('uuid/v4');
const CombinedStream = require('combined-stream');
const isStream = require('is-stream');
const { Buffer } = require('safe-buffer');

/**
 * A multipart builder for any request library. It's based on request/request lib.
 * @public
 * @class Multipart
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.preambleCRLF] - Add the pre CRLF character '\r\n'
 * @param {boolean} [options.postambleCRLF] - Add the post CRLF character '\r\n'
 * @returns {Multipart}
 * @example
 * const Multipart = require('multipart-request-buildier');
 * const options = {
 *  preambleCRLF: true,
 *  postambleCRLF true
 * }
 *
 * const multipartInstance = new Multipart(options);
 * const reqOptions = {
 *    "chunked": false,
 *    "data": [
 *      { body: 'I am an attachment' },
 *      { body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json')) }
 *    ]
 *   }
 * const multipartRequest = multipartInstance.buildRequest(reqOptions);
 * // {
 * //   "body":"\r\nsommultipartbody\r\n"
 * //   "headers": {
 * //     "transfer-encoding":"chunked"
 * //   }
 * // }
 */
module.exports = class Multipart {
  constructor(options = {}) {
    this.headers = {};
    this.boundary = uuid();
    this.chunked = false;
    this.body = null;
    this.options = options;
  }

  isChunked(options) {
    let chunked = false;
    const parts = options.data || options;

    if (!parts.forEach) {
      throw new Error('Argument error, options.multipart.');
    }

    if (options.chunked !== undefined) {
      // eslint-disable-next-line prefer-destructuring
      chunked = options.chunked;
    }

    if (this.headers['transfer-encoding'] === 'chunked') {
      chunked = true;
    }

    if (!chunked) {
      parts.forEach(part => {
        if (typeof part.body === 'undefined') {
          throw new Error('Body attribute missing in multipart.');
        }
        if (isStream(part.body)) {
          chunked = true;
        }
      });
    }

    return chunked;
  }

  setHeaders(chunked) {
    if (chunked && !this.headers['transfer-encoding']) {
      this.headers['transfer-encoding'] = 'chunked';
    }

    const header = this.headers['content-type'];

    if (!header || header.indexOf('multipart') === -1) {
      this.headers['content-type'] = `multipart/related; boundary=${this.boundary}`;
    } else if (header.indexOf('boundary') !== -1) {
      this.boundary = header.replace(/.*boundary=([^\s;]+).*/, '$1');
    } else {
      this.headers['content-type'] = `${header}; boundary=${this.boundary}`;
    }
  }

  build(parts, chunked) {
    const body = chunked ? new CombinedStream() : [];

    function add(part) {
      if (typeof part === 'number') {
        // eslint-disable-next-line no-param-reassign
        part = part.toString();
      }
      return chunked ? body.append(part) : body.push(Buffer.from(part));
    }

    if (this.options.preambleCRLF) {
      add('\r\n');
    }

    parts.forEach(part => {
      let preamble = `--${this.boundary}\r\n`;
      Object.keys(part).forEach(key => {
        if (key === 'body') {
          return;
        }
        preamble += `${key}: ${part[key]}\r\n`;
      });
      preamble += '\r\n';
      add(preamble);
      add(part.body);
      add('\r\n');
    });
    add(`--${this.boundary}--`);

    if (this.options.postambleCRLF) {
      add('\r\n');
    }

    return body;
  }

  /**
   * Allows build the multipart request
   * @memberof Multipart#
   * @param {Object|string[]|object[]|Stream[]} options - The multipart options, could be an array of string, nodejs stream and objects, or an object to attached.
   * @param {string[]|object[]|Stream[]} [options.data] - Use it only if you have to change the value of chunked to true
   * @param {Object} [options.chunked] - wherever or not you need to split the data in chunks. If some operation.data is equals to a node Stream, chunked will be automatically true.
   * @returns {{headers:Object, body:Object}} the headers and body ready for the request
   * @example
   * const multipartRequest = multipartInstance.buildRequest(reqOptions);
   * // {
   * //   "body":"\r\nsommultipartbody\r\n"
   * //   "headers": {
   * //     "transfer-encoding":"chunked"
   * //   }
   * // }
   */
  buildRequest(options) {
    const chunked = this.isChunked(options);
    const parts = options.data || options;

    this.setHeaders(chunked);
    this.chunked = chunked;
    this.body = this.build(parts, chunked);

    return {
      body: this.body,
      headers: this.headers
    };
  }
};
