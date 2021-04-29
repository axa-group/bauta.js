import { RawContext } from '@bautajs/core';
import { FastifyReply, FastifyRequest } from 'fastify';

export function getRequest(
  ctx: RawContext<{ req: FastifyRequest; res: FastifyReply }>
): FastifyRequest {
  return ctx.raw.req;
}

export function getResponse(
  ctx: RawContext<{ req: FastifyRequest; res: FastifyReply }>
): FastifyReply {
  return ctx.raw.res;
}
