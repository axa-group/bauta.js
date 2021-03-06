import { RawContext, Context } from '@axa/bautajs-core';
import { FastifyReply, FastifyRequest } from 'fastify';

export function getRequest(ctx: Context): FastifyRequest {
  return (ctx as RawContext<{ req: FastifyRequest; res: FastifyReply }>).raw.req;
}

export function getResponse(ctx: Context): FastifyReply {
  return (ctx as RawContext<{ req: FastifyRequest; res: FastifyReply }>).raw.res;
}
