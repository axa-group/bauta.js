/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { OpenAPIV3 } from 'openapi-types';
import { DocumentParsed, RouteSchema } from '../utils/types';
import { logger } from '../logger';
import { stripResponseFormats } from './from-openapi-to-ajv';

const HttpOperations = new Set(['delete', 'get', 'head', 'patch', 'post', 'put', 'options']);

class ParserV3 {
  public document: DocumentParsed;

  constructor({ paths, ...spec }: OpenAPIV3.Document) {
    this.document = { generic: spec, routes: [] };
    this.processPaths(paths);
  }

  private static makeOperationId(path: string) {
    // e.g. get /user/{name}  becomes getUserByName
    const firstUpper = (str: string) => str.substr(0, 1).toUpperCase() + str.substr(1);
    const by = (_: any, p1: string) => `By${firstUpper(p1)}`;
    const parts = path.split('/').slice(1);
    const opId = parts
      .map((item, i) => (i > 0 ? firstUpper(item) : item))
      .join('')
      .replace(/{(\w+)}/g, by)
      .replace(/[^a-z]/gi, '');
    return opId;
  }

  public static makeURL(path: string) {
    return path.replace(/{(\w+)}/g, ':$1');
  }

  public static copyProps(source: any, target: any, list: string[]) {
    list.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      if (source[item]) target[item] = source[item];
    });
  }

  private static parseParams(data: OpenAPIV3.ParameterObject[]) {
    const params: any = {
      type: 'object',
      properties: {}
    };
    const required: string[] = [];
    data.forEach(item => {
      params.properties[item.name] = item.schema;
      this.copyProps(item, params.properties[item.name], ['description']);
      // ajv wants "required" to be an array, which seems to be too strict
      // see https://github.com/json-schema/json-schema/wiki/Properties-and-required
      if (item.required) {
        required.push(item.name);
      }
    });
    if (required.length > 0) {
      params.required = required;
    }
    return params;
  }

  private static parseParameters(
    routeSchema: RouteSchema,
    data: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject>
  ) {
    const params: OpenAPIV3.ParameterObject[] = [];
    const querystring: OpenAPIV3.ParameterObject[] = [];
    const headers: OpenAPIV3.ParameterObject[] = [];
    // const formData = [];
    data.forEach(item => {
      const parameter = item as OpenAPIV3.ParameterObject;
      switch (parameter.in) {
        case 'path':
          params.push(parameter);
          break;
        case 'query':
          querystring.push(parameter);
          break;
        case 'header':
          headers.push(parameter);
          break;
        default:
          break;
      }
    });
    // eslint-disable-next-line no-param-reassign
    if (params.length > 0) routeSchema.params = this.parseParams(params);
    // eslint-disable-next-line no-param-reassign
    if (querystring.length > 0) routeSchema.querystring = this.parseParams(querystring);
    // eslint-disable-next-line no-param-reassign
    if (headers.length > 0) routeSchema.headers = this.parseParams(headers);
  }

  private static parseBody(data: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject) {
    let schema;
    const responseObject = data as OpenAPIV3.ResponseObject;
    if (responseObject && responseObject.content) {
      Object.keys(responseObject.content).forEach(mimeType => {
        if (mimeType !== 'application/json') {
          logger.debug(`body type: ${mimeType} found`);
        }
        schema = responseObject.content && responseObject.content[mimeType].schema;
      });
    }
    return schema;
  }

  private static parseResponses(responses: OpenAPIV3.ResponsesObject | undefined) {
    const result: any = {};
    let hasResponse = false;
    if (responses) {
      Object.keys(responses).forEach(httpCode => {
        const body = this.parseBody(responses[httpCode]);
        if (body !== undefined) {
          result[httpCode] = body;
          hasResponse = true;
        }
      });
    }
    return hasResponse ? result : null;
  }

  private static makeSchema(routeSchema: RouteSchema, data: OpenAPIV3.OperationObject) {
    const schema = { ...routeSchema };
    const copyItems = ['tags', 'summary', 'description', 'operationId'];
    ParserV3.copyProps(data, schema, copyItems);
    if (data.parameters) ParserV3.parseParameters(schema, data.parameters);
    const body = ParserV3.parseBody(data.requestBody as OpenAPIV3.ReferenceObject);
    if (body) schema.body = body;
    const response = ParserV3.parseResponses(data.responses);
    if (response) {
      schema.response = stripResponseFormats(response);
    }
    return schema;
  }

  processOperation(
    path: string,
    operation: string,
    data: OpenAPIV3.OperationObject,
    routeSchema: RouteSchema
  ) {
    const route = {
      method: operation.toUpperCase(),
      url: ParserV3.makeURL(path),
      schema: ParserV3.makeSchema(routeSchema, data),
      operationId: data.operationId || ParserV3.makeOperationId(path),
      openapiSource: data,
      isV2: false
    };
    this.document.routes.push(route);
  }

  processPaths(paths: OpenAPIV3.PathsObject) {
    const copyItems = ['summary', 'description'];
    Object.keys(paths).forEach(path => {
      const routeSchema: RouteSchema = {};
      const data: OpenAPIV3.PathItemObject = paths[path];

      ParserV3.copyProps(data, routeSchema, copyItems);
      if (typeof data.parameters === 'object') {
        ParserV3.parseParameters(routeSchema, data.parameters);
      }
      Object.keys(data).forEach(pathItem => {
        if (HttpOperations.has(pathItem)) {
          this.processOperation(
            path,
            pathItem,
            data[pathItem as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject,
            routeSchema
          );
        }
      });
    });
  }
}

export default ParserV3;
