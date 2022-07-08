import { Route, idGenerator, OpenAPIV2Document } from '@axa/bautajs-core';
import { OpenAPIV3 } from 'openapi-types';
import { IncomingHttpHeaders } from 'http';

function getContentType(route: Route, statusCode: number) {
  if (route.isV2) {
    const { produces } = route.openapiSource as OpenAPIV2Document;
    return produces && produces[0];
  }
  const { responses } = route.openapiSource as OpenAPIV3.OperationObject;
  const responseObject: OpenAPIV3.ResponseObject | undefined = responses?.[
    statusCode
  ] as OpenAPIV3.ResponseObject;

  return responseObject?.content?.[0];
}

function genReqId(headers: IncomingHttpHeaders) {
  return headers?.['x-request-id'] || idGenerator();
}
export { getContentType, genReqId };
