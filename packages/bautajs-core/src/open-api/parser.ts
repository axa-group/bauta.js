import { OpenAPI, OpenAPIV3, OpenAPIV2 } from 'openapi-types';
import SwaggerParser from '@apidevtools/swagger-parser';
import ParserV2 from './parserV2';
import ParserV3 from './parserV3';

import { DocumentParsed, Document, Logger } from '../types';

class Parser {
  private documentParsed?: DocumentParsed;

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
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
  public async asyncParse(specification: Document): Promise<DocumentParsed> {
    let spec;
    let data: OpenAPI.Document;

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
    } catch (e: any) {
      this.logger.error(
        { error: e },
        `Error on validate and parser the current openAPI definition; ${e.message}`
      );
      throw new Error(`The Openapi API definition provided is not valid. Error ${e.message}`);
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
