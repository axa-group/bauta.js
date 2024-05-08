import fastSafeStringify from 'fast-safe-stringify';

const truncate = (string: string, limit: number, disableTruncateLog: boolean): string => {
  if (string.length > limit && !disableTruncateLog) {
    return `${string.substring(0, limit)}...`;
  }
  return string;
};

export function prepareToLog(
  object: any,
  truncateLogSize = 3200,
  disableTruncateLog = false
): string {
  if (typeof object === 'object') {
    return truncate(fastSafeStringify.default(object), truncateLogSize, disableTruncateLog);
  }

  return truncate(object, truncateLogSize, disableTruncateLog);
}

export default prepareToLog;
