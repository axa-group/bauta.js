export function isLoggerValid(logger: any): boolean {
  if (!logger) {
    return false;
  }
  const methods = ['info', 'error', 'debug', 'fatal', 'warn', 'trace', 'child'];

  return methods.every(m => logger[m] && typeof logger[m] === 'function');
}

export default isLoggerValid;
