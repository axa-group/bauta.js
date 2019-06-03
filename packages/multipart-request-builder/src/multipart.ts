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
import CombinedStream from 'combined-stream';
import isStream from 'is-stream';
import { v4 } from 'uuid';

interface Headers {
  [key: string]: any;
}
export interface MultipartData {
  'content-type'?: string;
  body: any;
}
export interface MultipartOptions {
  preambleCRLF?: boolean;
  postambleCRLF?: boolean;
}
export interface MultipartBody {
  chunked: boolean;
  data?: MultipartData[];
}
export interface RequestPart {
  headers?: Headers;
  body: any;
}
export type MultipartRequestBody = RequestPart[] | MultipartBody;

/**
 * A multipart builder for any request library. It's based on request/request lib.
 * @param {MultipartOptions} [options={}]
 * @export
 * @class Multipart
 * @example
 * const { Multipart } = require('multipart-request-buildier');
 * const options = {
 *  preambleCRLF: true,
 *  postambleCRLF true
 * }
 *
 * const multipartInstance = new Multipart(options);
 * const reqOptions = [
 *      { body: 'I am an attachment' },
 *      { body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json')) }
 * ]
 * const multipartRequest = multipartInstance.buildRequest(reqOptions);
 * // {
 * //   "body":"\r\nsommultipartbody\r\n"
 * //   "headers": {
 * //     "transfer-encoding":"chunked"
 * //   }
 * // }
 */
export class Multipart {
  private headers: any = {};

  private boundary: string;

  private options: MultipartOptions;

  constructor(options: MultipartOptions = {}) {
    this.boundary = v4();
    this.options = options;
  }

  private isChunked(options: MultipartRequestBody): boolean {
    let chunked = false;
    const parts: RequestPart[] | MultipartData[] =
      (options as MultipartBody).data || (options as RequestPart[]);

    if (!parts.forEach) {
      throw new Error('Argument error, options.multipart.');
    }

    if ((options as MultipartBody).chunked !== undefined) {
      // eslint-disable-next-line prefer-destructuring
      chunked = (options as MultipartBody).chunked;
    }

    if (this.headers['transfer-encoding'] === 'chunked') {
      chunked = true;
    }

    if (!chunked) {
      (parts as RequestPart[]).forEach(part => {
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

  private setHeaders(chunked: boolean): void {
    if (chunked && !this.headers['transfer-encoding']) {
      this.headers['transfer-encoding'] = 'chunked';
    }

    const header: string = this.headers['content-type'];

    if (!header || header.indexOf('multipart') === -1) {
      this.headers['content-type'] = `multipart/related; boundary=${this.boundary}`;
    } else if (header.indexOf('boundary') !== -1) {
      this.boundary = header.replace(/.*boundary=([^\s;]+).*/, '$1');
    } else {
      this.headers['content-type'] = `${header}; boundary=${this.boundary}`;
    }
  }

  private build(parts: any, chunked: boolean): CombinedStream | any[] {
    const body: CombinedStream | any[] = chunked ? new CombinedStream() : [];

    function add(part: any) {
      if (typeof part === 'number') {
        // eslint-disable-next-line no-param-reassign
        part = part.toString();
      }
      return chunked
        ? (body as CombinedStream).append(part)
        : (body as any[]).push(Buffer.from(part));
    }

    if (this.options.preambleCRLF) {
      add('\r\n');
    }

    parts.forEach((part: any) => {
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
   * @param {MultipartRequestBody} options
   * @returns {RequestPart}
   * @memberof Multipart
   * @example
   * const multipartRequest = multipartInstance.buildRequest(reqOptions);
   * // {
   * //   "body":"\r\nsommultipartbody\r\n"
   * //   "headers": {
   * //     "transfer-encoding":"chunked"
   * //   }
   * // }
   */
  public buildRequest(options: MultipartRequestBody): RequestPart {
    const chunked: boolean = this.isChunked(options);
    const parts: any = (options as MultipartBody).data || (options as RequestPart[]);

    this.setHeaders(chunked);

    return {
      body: this.build(parts, chunked),
      headers: this.headers
    };
  }
}

export default Multipart;
