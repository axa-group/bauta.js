/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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
const safeStringify = require('fast-safe-stringify');

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

function defaultLoader() {
  if (this.dataSource) {
    return this.dataSource.request();
  }
  const error = new Error('Not found');
  return Promise.reject(Object.assign(error, { statusCode: 404 }));
}

module.exports = {
  prepareToLog,
  defaultLoader
};
