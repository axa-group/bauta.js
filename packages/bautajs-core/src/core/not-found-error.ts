/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import fastSafeStringify from 'fast-safe-stringify';

export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 404) {
    super(message);
    this.name = 'Not Found Error';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, NotFoundError);
    this.stack = this.formatStack();
    this.message = message;
  }

  private formatStack() {
    return `${this.name}: ${this.message} \n ${fastSafeStringify(this, undefined, 2)}`;
  }

  public toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message
    };
  }
}

export default NotFoundError;
