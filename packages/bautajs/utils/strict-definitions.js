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

const getRefTypes = obj => set(scanProp(obj, '$ref').map(n => n.substr(n.lastIndexOf('/') + 1)));

const findSchemas = schemas => names =>
  names.reduce((acc, cur) => ({ ...acc, [cur]: schemas[cur] }), {});

function filterTags(tags, operations) {
  const usedTags = flatMap(operations, op => op.tags);
  return tags.filter(t => usedTags.includes(t.name));
}

function filterSchemas(schemas, operations) {
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

function filterComponents(components, operations) {
  return {
    ...components,
    schemas: filterSchemas(components.schemas, operations)
  };
}

module.exports = function getStrictDefinition(definition) {
  const operations = flatMap(values(definition.paths), p => values(p));

  return {
    ...definition,
    tags: definition.tags ? filterTags(definition.tags, operations) : null,
    components: definition.components ? filterComponents(definition.components, operations) : null,
    definitions: definition.definitions ? filterSchemas(definition.definitions, operations) : null
  };
};
