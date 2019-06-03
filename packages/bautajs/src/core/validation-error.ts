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
import { IValidationError, LocationError } from '../utils/types';

export class ValidationError extends Error implements IValidationError {
  public errors: LocationError[];

  public statusCode: number;

  public response: any;

  constructor(message: string, errors: LocationError[], statusCode: number = 500, response?: any) {
    super(message);

    this.errors = errors;

    this.statusCode = statusCode;

    this.response = response;
    Error.captureStackTrace(this, ValidationError);
  }

  get [Symbol.toStringTag]() {
    if (Array.isArray(this.errors) && this.errors.length > 0) {
      const errors = this.errors.map(err => `${err.location}.${err.path} ${err.message}`).join(',');
      return `${this.statusCode}:${this.message || 'Validation error'} - ${errors} - ${this.stack}`;
    }
    return `${this.statusCode}:${this.message} - ${this.stack}`;
  }
}

export default ValidationError;
