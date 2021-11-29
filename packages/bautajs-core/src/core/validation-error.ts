import fastSafeStringify from 'fast-safe-stringify';
import { IValidationError, LocationError } from '../types';

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
