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
const values = obj => Object.keys(obj || {}).map(k => obj[k]);

const flatMap = (arr, fn) =>
  arr.reduce((acc, cur) => {
    acc.push(...fn(cur));
    return acc;
  }, []);

const set = arr =>
  arr.reduce((acc, cur) => {
    if (!acc.includes(cur)) {
      acc.push(cur);
    }
    return acc;
  }, []);

const scanProp = (obj, prop) => {
  if (typeof obj !== 'object') {
    return [];
  }
  const props = Object.keys(obj);
  if (props.includes(prop)) {
    return [obj[prop]];
  }
  return flatMap(props, p => scanProp(obj[p], prop));
};

const getRefTypes = obj =>
  set(
    scanProp(obj, '$ref')
      .filter(n => n.includes('schemas') || n.includes('definitions'))
      .map(n => n.substr(n.lastIndexOf('/') + 1))
  );

const findSchemas = schemas => names =>
  names.reduce((acc, cur) => ({ ...acc, [cur]: schemas[cur] }), {});

function filterTags(tags, operations) {
  const usedTags = flatMap(operations, op => op.tags);
  return tags.filter(t => usedTags.includes(t.name));
}

function filterSchemas(operations, { schemas, ...components }) {
  const find = findSchemas(schemas);

  let lastRefs = [];
  let refs = getRefTypes(operations);
  let usedSchemas;

  Object.keys(components).forEach(key => {
    const paramsRefs = getRefTypes(components[key]);
    refs = [...refs, ...paramsRefs];
  });

  do {
    usedSchemas = find(refs);
    lastRefs = refs;
    refs = set([...refs, ...getRefTypes(usedSchemas)]);
  } while (lastRefs.length !== refs.length);

  return usedSchemas;
}

function filterComponents(components, operations) {
  return {
    ...components,
    schemas: filterSchemas(operations, components)
  };
}

module.exports = function getStrictDefinition(definition) {
  const operations = flatMap(values(definition.paths), p => values(p));

  return {
    ...definition,
    tags: definition.tags ? filterTags(definition.tags, operations) : null,
    components: definition.components ? filterComponents(definition.components, operations) : null,
    definitions: definition.definitions
      ? filterSchemas(operations, {
          schemas: definition.definitions,
          responses: definition.responses,
          parameters: definition.parameters
        })
      : null
  };
};
