const { pipe, resolver, step } = require('@axa/bautajs-core');
const { getRequest } = require('@axa/bautajs-fastify');

const transformResponse = step(response => {
  return {
    message: response
  };
});

function getQueryParamStep(_prev, ctx) {
  const req = getRequest(ctx);

  const { chickenIds } = req.query;

  return `This is the general text for requests and now we are receiving: ${chickenIds}`;
}

module.exports = resolver(operations => {
  operations.queryParamAsArray
    .validateRequest(true)
    .validateResponse(false)
    .setup(pipe(getQueryParamStep, transformResponse));

  operations.queryParamAsArrayCsv
    .validateRequest(true)
    .validateResponse(false)
    .setup(pipe(getQueryParamStep, transformResponse));
});
