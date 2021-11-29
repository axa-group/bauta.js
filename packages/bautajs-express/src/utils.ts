/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
