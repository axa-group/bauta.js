import { Context, RawContext } from '@axa-group/bautajs-core';
import { Response } from 'express';
import { ExpressRequest } from './types';

export function getRequest(ctx: Context): ExpressRequest {
  return (ctx as RawContext<{ req: ExpressRequest; res: Response }>).raw.req;
}

export function getResponse(ctx: Context): Response {
  return (ctx as RawContext<{ req: ExpressRequest; res: Response }>).raw.res;
}
