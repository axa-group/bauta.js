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
import http from 'http';
import https from 'https';
import { Route } from '@bautajs/core';
import { OpenAPIV2 } from '@bautajs/core/node_modules/openapi-types';
import { AddressInfo } from 'net';

function getContentType(route: Route, statusCode: number) {
  if (route.isV2) {
    const produces = route.openapiSource as OpenAPIV2.OperationObject;
    return produces && produces[0];
  }
  const { responses } = route.openapiSource;

  return responses && responses[statusCode] && responses[statusCode][0];
}

function getServerAddress(server: https.Server | http.Server, isHttps: boolean): string {
  let address = server.address();
  const isUnixSocket = typeof address === 'string';
  if (!isUnixSocket) {
    if ((address as AddressInfo).address.indexOf(':') === -1) {
      address = `${(address as AddressInfo).address}:${(address as AddressInfo).port}`;
    } else {
      address = `[${(address as AddressInfo).address}]:${(address as AddressInfo).port}`;
    }
  }
  address = (isUnixSocket ? '' : `http${isHttps ? 's' : ''}://`) + address;
  return address;
}

export { getContentType, getServerAddress };
