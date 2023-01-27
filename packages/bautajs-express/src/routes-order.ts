const STATIC_ROUTE = 1;
const ROUTE_WITH_SUFFIX = 11;
const ROUTE_WITH_PARAM = 111;
const ROUTE_WITH_OPTIONAL_PARAM = 1111;

const REGEXP_CONTAINS_OPTIONAL_PARAM = /^:(.*)\?/;
const REGEXP_CONTAINS_SUFFIX = /^:(.*)\./;
const REGEXP_CONTAINS_PARAM = /^:/;

function toValue(str: string) {
  if (str === '*') return Number.MAX_SAFE_INTEGER;
  if (REGEXP_CONTAINS_OPTIONAL_PARAM.test(str)) return ROUTE_WITH_OPTIONAL_PARAM;
  if (REGEXP_CONTAINS_SUFFIX.test(str)) return ROUTE_WITH_SUFFIX;
  if (REGEXP_CONTAINS_PARAM.test(str)) return ROUTE_WITH_PARAM;
  return STATIC_ROUTE;
}

function toRank(str: string) {
  const arr = str.split('/');
  const value = arr.reduce((acc, curr) => {
    return acc + toValue(curr);
  }, '');
  return (arr.length - 1) / +value;
}

function compareRoutes(firstRoute: string, secondRoute: string) {
  return toRank(secondRoute) - toRank(firstRoute);
}

export function sortRoutes(routes: string[]) {
  const workArray = [...routes];
  return workArray.sort(compareRoutes);
}
