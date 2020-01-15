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
