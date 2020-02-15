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
