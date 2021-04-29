import { RawContext } from '@bautajs/core';
import { Response } from 'express';
import { ExpressRequest } from './types';

export function getRequest(
  ctx: RawContext<{ req: ExpressRequest; res: Response }>
): ExpressRequest {
  return ctx.raw.req;
}

export function getResponse(ctx: RawContext<{ req: ExpressRequest; res: Response }>): Response {
  return ctx.raw.res;
}
