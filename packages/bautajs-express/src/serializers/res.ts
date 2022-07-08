import { Response } from 'express';

const rawSymbol = Symbol('pino-raw-res-ref');
const pinoResProto = Object.create(
  {},
  {
    statusCode: {
      enumerable: true,
      writable: true,
      value: 0
    }
  }
);
Object.defineProperty(pinoResProto, rawSymbol, {
  writable: true,
  value: {}
});

export function resSerializer(res: Response) {
  const serializerResponse = Object.create(pinoResProto);
  serializerResponse.statusCode = res.statusCode;
  return serializerResponse;
}
