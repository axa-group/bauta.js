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
const BautaJS = require('bautajs');
/* 
function add(schema, fn) {
  const { method, path, successStatus } = getExposeValuesFromSchema(schema);
  this.app[method](this.apiDefinition.basePath + path, (req, res, next) => {
    const startTime = new Date();
    const resolverWraper = response => {
      if (!response) {
        res.json({});
      } else {
        res.json(response);
      }
      res.status(successStatus);
      const finalTime = new Date().getTime() - startTime.getTime();

      logger.log.info(
        `The operation execution of ${this.apiDefinition.basePath + path} taked: ${
          isNumber(finalTime) ? finalTime.toFixed(2) : 'unkown'
        } ms`
      );
      res.end();
    };
    const rejectWraper = response => {
      res.status(response.statusCode || 500);
      const finalTime = new Date().getTime() - startTime.getTime();
      logger.log.info(
        `The operation execution of ${this.apiDefinition.basePath + path} taked: ${
          isNumber(finalTime) ? finalTime.toFixed(2) : 'unkown'
        } ms`
      );

      return next(response);
    };

    fn(req, res)
      .then(resolverWraper)
      .catch(rejectWraper);
  });

  mergeEndpointMethods(this.schemas, schema);

  return { method, path, apiRoot: this.apiDefinition.basePath };
}
 */

class BautaJSExpress extends BautaJS {}

module.exports = BautaJSExpress;
