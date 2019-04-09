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
const safeStringify = require('fast-safe-stringify');
const merge = require('deepmerge');

function truncate(string, limit) {
  if (string.length > limit) {
    return `${string.substring(0, limit)}...`;
  }
  return string;
}

function prepareToLog(object) {
  if (typeof object === 'object') {
    return truncate(safeStringify(object), 3200);
  }

  return truncate(object, 32000);
}

function defaultLoader(_, ctx) {
  if (ctx.dataSource) {
    return ctx.dataSource(ctx).request();
  }
  const error = new Error('Not found');
  return Promise.reject(Object.assign(error, { statusCode: 404 }));
}

const emptyTarget = value => (Array.isArray(value) ? [] : {});
const clone = (value, options) => merge(emptyTarget(value), value, options);

function combineMerge(target, source, options) {
  const destination = target.slice();

  source.forEach((e, i) => {
    if (typeof destination[i] === 'undefined') {
      const cloneRequested = options.clone !== false;
      const shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone ? clone(e, options) : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = merge(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });
  return destination;
}

module.exports = {
  combineMerge,
  prepareToLog,
  defaultLoader
};
