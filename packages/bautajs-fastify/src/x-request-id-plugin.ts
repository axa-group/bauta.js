import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

async function xRequestId(fastify: FastifyInstance) {
  fastify.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.header('x-request-id', req.id);
  });
}

export default fp(xRequestId, {
  fastify: '4.x',
  name: 'bautajs-x-request-id'
});
