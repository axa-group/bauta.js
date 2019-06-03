import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { Dictionary, Document } from './types';

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
  if (typeof obj !== 'object') {
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

function filterSchemas(schemas: any, operations: OpenAPI.Operation[]): any {
  const find = findSchemas(schemas);

  let lastRefs = [];
  let refs = getRefTypes(operations);
  let usedSchemas;

  do {
    usedSchemas = find(refs);
    lastRefs = refs;
    refs = set([...refs, ...getRefTypes(usedSchemas)]);
  } while (lastRefs.length !== refs.length);

  return usedSchemas;
}

function filterComponents(
  components: OpenAPIV3.ComponentsObject | undefined,
  operations: OpenAPI.Operation[]
) {
  return {
    ...components,
    schemas: filterSchemas(components && components.schemas, operations)
  };
}

export function getStrictDefinition<T extends Document>(definition: T): T {
  const operations: OpenAPI.Operation[] = flatMap(values(definition.paths), p => values(p));

  return {
    ...definition,
    tags: definition.tags ? filterTags(definition.tags, operations) : undefined,
    components: (definition as OpenAPIV3.Document).components
      ? filterComponents((definition as OpenAPIV3.Document).components, operations)
      : undefined,
    definitions: (definition as OpenAPIV2.Document).definitions
      ? filterSchemas((definition as OpenAPIV2.Document).definitions, operations)
      : undefined
  };
}

export default getStrictDefinition;
