import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { Document, OpenAPIComponents, SwaggerComponents, Dictionary } from './types';

const values = <T>(obj: Dictionary<T>): T[] => Object.keys(obj || {}).map(k => obj[k]);

const flatMap = (arr: any[], fn: (p: any) => any[]): any[] =>
  arr.reduce((acc: any[], cur: any) => {
    acc.push(...fn(cur));
    return acc;
  }, []);

const set = <T>(arr: T[]): T[] =>
  arr.reduce((acc: T[], cur: T) => {
    if (!acc.includes(cur)) {
      acc.push(cur);
    }
    return acc;
  }, []);

const scanProp = (obj: Dictionary<any>, prop: string): string[] => {
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }
  const props = Object.keys(obj);
  if (props.includes(prop)) {
    return [obj[prop]];
  }
  return flatMap(props, p => scanProp(obj[p], prop));
};

const getRefTypes = (obj: Dictionary<any>) =>
  set(scanProp(obj, '$ref').map(n => n.substr(n.lastIndexOf('/') + 1)));

const findSchemas = (schemas: any) => (names: string[]) =>
  names.reduce((acc, cur) => ({ ...acc, [cur]: schemas && schemas[cur] }), {});

function filterTags(
  tags: OpenAPIV2.TagObject[] | OpenAPIV3.TagObject[],
  operations: OpenAPI.Operation[]
) {
  const usedTags = flatMap(operations, op => op.tags);
  return tags.filter(t => usedTags.includes(t.name));
}

function filterSchemas(
  schemas: any,
  operations: OpenAPI.Operation[],
  parameters?: {
    [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject;
  },
  responses?: OpenAPIV3.ResponsesObject
): any {
  const find = findSchemas(schemas);

  let lastRefs = [];
  let refs = getRefTypes(operations);
  let usedSchemas;

  if (parameters) {
    const paramsRefs = getRefTypes(parameters);
    refs = [...refs, ...paramsRefs];
  }

  if (responses) {
    const respRefs = getRefTypes(responses);
    refs = [...refs, ...respRefs];
  }

  do {
    usedSchemas = find(refs);
    lastRefs = refs;
    refs = set([...refs, ...getRefTypes(usedSchemas)]);
  } while (lastRefs.length !== refs.length);

  return usedSchemas;
}

function filterComponents(components: OpenAPIV3.ComponentsObject, operations: OpenAPI.Operation[]) {
  return {
    ...components,
    schemas: filterSchemas(
      components.schemas,
      operations,
      components.parameters,
      components.responses
    )
  };
}

export function getComponents<T extends Document>(
  definition: T
): SwaggerComponents | OpenAPIComponents {
  if ((definition as OpenAPIV3.Document).openapi) {
    const openapi: OpenAPIV3.Document = definition as OpenAPIV3.Document;

    return {
      apiVersion: definition.info.version,
      swaggerVersion: '3',
      validateRequest: definition.validateRequest,
      validateResponse: definition.validateResponse,
      ...openapi.components
    };
  }

  const swagger: OpenAPIV2.Document = definition as OpenAPIV2.Document;

  return {
    validateRequest: definition.validateRequest,
    validateResponse: definition.validateResponse,
    apiVersion: definition.info.version,
    swaggerVersion: '2',
    schemes: swagger.schemes,
    consumes: swagger.consumes,
    produces: swagger.produces,
    definitions: swagger.definitions,
    parameters: swagger.parameters,
    responses: swagger.responses,
    securityDefinitions: swagger.securityDefinitions,
    security: swagger.security,
    externalDocs: swagger.externalDocs
  };
}

export function getStrictDefinition<T extends Document>(definition: T): T {
  const operations: OpenAPI.Operation[] = flatMap(values(definition.paths), p => values(p));

  return {
    ...definition,
    tags: definition.tags ? filterTags(definition.tags, operations) : undefined,
    components: (definition as OpenAPIV3.Document).components
      ? filterComponents(getComponents(definition) as OpenAPIV3.ComponentsObject, operations)
      : undefined,
    definitions: (definition as OpenAPIV2.Document).definitions
      ? filterSchemas(getComponents(definition), operations)
      : undefined
  };
}

export default getStrictDefinition;
