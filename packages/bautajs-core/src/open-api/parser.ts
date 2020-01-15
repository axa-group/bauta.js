/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
      logger.error('Error on validate and parser the current openAPI definition', e);
      throw new Error('The Openapi API definition provided is not valid.');
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
