import { OpenAPIV2 } from 'openapi-types';
import { DocumentParsed, Route, RouteSchema } from '../types';

class ParserV2 {
  public document: DocumentParsed;

  constructor({ paths, ...spec }: OpenAPIV2.Document) {
    this.document = { generic: spec, routes: [] };
    this.processPaths(paths);
  }

  private static makeOperationId(path: string) {
    // e.g. get /user/{name}  becomes getUserByName
    const firstUpper = (str: string) => str.substr(0, 1).toUpperCase() + str.substr(1);
    const by = (_: any, p1: string) => `By${firstUpper(p1)}`;
    const parts = path.split('/').slice(1);
    return parts
      .map((item, i) => (i > 0 ? firstUpper(item) : item))
      .join('')
      .replace(/{(\w+)}/g, by)
      .replace(/[^a-z]/gi, '');
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

  private static parseParams(data: OpenAPIV2.ParameterObject[]) {
    const params: any = {
      type: 'object',
      properties: {}
    };
    const required: string[] = [];
    data.forEach(item => {
      // item.type "file" breaks ajv, so treat is as a special here
      if (item.type === 'file') {
        Object.assign(item, { type: 'string', isFile: true });
      }
      //
      params.properties[item.name] = {};
      ParserV2.copyProps(item, params.properties[item.name], ['type', 'description']);
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

  private static parseParameters(routeSchema: RouteSchema, data: OpenAPIV2.Parameters) {
    const params: OpenAPIV2.ParameterObject[] = [];
    const querystring: OpenAPIV2.ParameterObject[] = [];
    const headers: OpenAPIV2.ParameterObject[] = [];
    const formData: OpenAPIV2.ParameterObject[] = [];
    data.forEach(item => {
      const parameter = item as OpenAPIV2.InBodyParameterObject;
      switch (parameter.in) {
        case 'body':
          // eslint-disable-next-line no-param-reassign
          routeSchema.body = parameter.schema;
          break;
        case 'formData':
          formData.push(parameter);
          break;
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
    if (params.length > 0) routeSchema.params = ParserV2.parseParams(params);
    // eslint-disable-next-line no-param-reassign
    if (querystring.length > 0) routeSchema.querystring = ParserV2.parseParams(querystring);
    // eslint-disable-next-line no-param-reassign
    if (headers.length > 0) routeSchema.headers = ParserV2.parseParams(headers);
    // eslint-disable-next-line no-param-reassign
    if (formData.length > 0) routeSchema.body = ParserV2.parseParams(formData);
  }

  private static parseResponses(responses: OpenAPIV2.ResponsesObject) {
    const result: any = {};
    let hasResponse = false;
    Object.keys(responses).forEach(httpCode => {
      const schema = (
        responses[httpCode as keyof OpenAPIV2.ResponseObject] as OpenAPIV2.SchemaObject
      )?.schema;
      if (schema) {
        result[httpCode] = schema;
        hasResponse = true;
      }
    });

    return hasResponse ? result : null;
  }

  private static makeSchema(data: OpenAPIV2.OperationObject) {
    const routeSchema: RouteSchema = {};
    const copyItems = [
      'tags',
      'summary',
      'description',
      'operationId',
      'produces',
      'consumes',
      'deprecated'
    ];
    ParserV2.copyProps(data, routeSchema, copyItems);
    if (data.parameters) ParserV2.parseParameters(routeSchema, data.parameters);
    const response = ParserV2.parseResponses(data.responses);
    if (response) {
      routeSchema.response = response;
    }
    return routeSchema;
  }

  processOperation(path: string, operation: string, data: OpenAPIV2.OperationObject) {
    const route: Route = {
      method: operation.toUpperCase(),
      url: ParserV2.makeURL(path),
      schema: ParserV2.makeSchema(data),
      operationId: data.operationId || ParserV2.makeOperationId(path),
      openapiSource: data,
      isV2: true,
      path
    };
    this.document.routes.push(route);
  }

  processPaths(paths: OpenAPIV2.PathsObject): void {
    Object.keys(paths).forEach((path: string) => {
      Object.keys(paths[path]).forEach(operation => {
        this.processOperation(path, operation, (paths[path] as any)[operation]);
      });
    });
  }
}

export default ParserV2;
