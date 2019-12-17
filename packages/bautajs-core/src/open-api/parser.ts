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
import { OpenAPI, OpenAPIV3, OpenAPIV2 } from 'openapi-types';
import SwaggerParser from 'swagger-parser';
import deasync from 'deasync';
import ParserV2 from './parserV2';
import ParserV3 from './parserV3';
import { logger } from '../logger';
import { DocumentParsed, Document } from '../utils/types';

class Parser {
  private validateRequestToggle: boolean = true;

  private validateResponseToggle: boolean = true;

  private documentParsed?: DocumentParsed;

  public parse = deasync((apiDefinition: OpenAPI.Document, cb: any) =>
    this.asyncParse(apiDefinition)
      .then(res => cb(undefined, res))
      .catch(cb)
  );

  /**
   * global validate request toggle
   * @returns {object}
   */
  public validateRequest(): boolean {
    return this.validateRequestToggle;
  }

  /**
   * global validate responses toggle
   * @returns {object}
   */
  public validateResponse(): boolean {
    return this.validateResponseToggle;
  }

  /**
   * get the parsed document
   * @returns {object}
   */
  public document(): DocumentParsed | undefined {
    return this.documentParsed;
  }

  /**
   * Parse a openapi specification
   * @param {string|object} specification Filename of JSON/YAML file or object containing an openapi specification
   * @returns {object} fastify configuration information
   */
  private async asyncParse({
    validateRequest,
    validateResponse,
    ...specification
  }: Document): Promise<DocumentParsed> {
    let spec;
    let data: OpenAPI.Document;
    this.validateRequestToggle = validateRequest !== false;
    this.validateResponseToggle = validateRequest !== false;

    try {
      // parse first, to avoid dereferencing of $ref's
      data = await SwaggerParser.parse({
        ...specification,
        // Compatibility, older version of validation didn't validate termsOfService
        info: { termsOfService: 'http://test.test', ...specification.info }
      });
      // save the original (with $refs) because swp.validate modifies its input
      const copy = JSON.parse(JSON.stringify(data, null, 2));
      // and validate
      spec = await SwaggerParser.validate(copy);
    } catch (e) {
      logger.error('Error on validate and parser the current openAPI definition');
      throw e;
    }
    const openAPI = spec as OpenAPIV3.Document;
    const swagger = spec as OpenAPIV2.Document;

    if (swagger.swagger && swagger.swagger.indexOf('2.0') === 0) {
      const parserV2 = new ParserV2(swagger);
      this.documentParsed = parserV2.document;
      return this.documentParsed;
    }
    if (openAPI.openapi && openAPI.openapi.indexOf('3.0') === 0) {
      const parserV3 = new ParserV3(openAPI);
      this.documentParsed = parserV3.document;
      return this.documentParsed;
    }
    throw new Error(
      "'specification' parameter must contain a valid version 2.0 or 3.0.x specification"
    );
  }
}

export default Parser;
