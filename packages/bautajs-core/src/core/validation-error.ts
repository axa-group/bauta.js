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
import { IValidationError, LocationError } from '../utils/types';

export class ValidationError extends Error implements IValidationError {
  public errors: LocationError[];

  public statusCode: number;

  public response: any;

  constructor(message: string, errors: LocationError[], statusCode: number = 500, response?: any) {
    super(message);
    this.name = 'Validation Error';
    this.errors = errors;
    this.statusCode = statusCode;
    this.response = response;
    Error.captureStackTrace(this, ValidationError);
    this.stack = this.formatStack();
    this.message = message;
  }

  private formatStack() {
    return `${this.name}: ${this.message} \n ${fastSafeStringify(this, undefined, 2)}`;
  }

  public toJSON() {
    return {
      name: this.name,
      errors: this.errors,
      statusCode: this.statusCode,
      response: this.response,
      message: this.message
    };
  }
}

export default ValidationError;
