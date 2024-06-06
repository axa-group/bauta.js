import { pipe, resolver, step } from '@axa/bautajs-core';
import { getRequest } from '@axa/bautajs-fastify';

const transformResponse = step(response => {
  return {
    message: response
  };
});

function getQueryParamStep(_prev, ctx) {
  const req = getRequest(ctx);

  const { chickenIds } = req.query;

  return `This is the general text for requests and now we are receiving: ${JSON.stringify(
    chickenIds
  )}`;
}

export default resolver(operations => {
  operations.queryParamAsArray
    .validateRequest(true)
    .validateResponse(false)
    .setup(pipe(getQueryParamStep, transformResponse));
});
