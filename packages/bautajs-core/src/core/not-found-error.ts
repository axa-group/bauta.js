import fastSafeStringify from 'fast-safe-stringify';

export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 404) {
    super(message);
    this.name = 'Not Found Error';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, NotFoundError);
    this.stack = this.formatStack();
    this.message = message;
  }

  private formatStack() {
    return `${this.name}: ${this.message} \n ${fastSafeStringify.default(this, undefined, 2)}`;
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
