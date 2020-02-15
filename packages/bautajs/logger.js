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
const debug = require('debug');
const EventEmmiter = require('events');

const moduleName = 'bautajs';
const eventTypes = {
  PUSH_STEP: 1,
  UNSHIFT_STEP: 2,
  REGISTER_SERVICE: 3,
  DATASOURCE_REQUEST: 4,
  DATASOURCE_RESPONSE: 5,
  EXPOSE_OPERATION: 6
};
const emmiter = new EventEmmiter();

function buildLogger(namespace) {
  const levels = ['debug', 'trace', 'log', 'info', 'warn', 'error'];
  return levels.reduce(
    (acc, level) => {
      acc[level] = debug(`${namespace}:${level}`);
      return acc;
    },
    {
      events: emmiter,
      eventTypes
    }
  );
}

/**
 * A logger instance of debug
 * @constant Logger
 * @type {{debug,trace,log,info,warn,error,events,eventTypes}}
 */
module.exports = Object.assign(buildLogger(moduleName), {
  create(namespace) {
    return buildLogger(moduleName + namespace);
  }
});
