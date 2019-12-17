import { Route } from '@bautajs/core';
import { OpenAPIV2 } from '@bautajs/core/node_modules/openapi-types';

function getContentType(route: Route, statusCode: number) {
  if (route.isV2) {
    const produces = route.openapiSource as OpenAPIV2.OperationObject;
    return produces && produces[0];
  }
  const { responses } = route.openapiSource;

  return responses && responses[statusCode] && responses[statusCode][0];
}

export { getContentType };
