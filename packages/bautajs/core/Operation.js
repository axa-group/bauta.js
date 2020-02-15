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
const chalk = require('chalk');
const applyFilter = require('loopback-filters');
const OpenAPIRequestValidator = require('@javi11/openapi-request-validator').default;
const OpenAPIDefaultSetter = require('openapi-default-setter').default;
const OpenAPIResponseValidator = require('openapi-response-validator').default;

const ValidationError = require('./ValidationError');
const validate = require('../validators/validate');
const apiPathSchema = require('../validators/api-path-schema.json');
const logger = require('../logger');
const Step = require('./Step');
const buildDataSource = require('../request/datasource');
const sessionFactory = require('../session-factory');

function defaultResolver(_, ctx) {
  if (ctx.dataSource) {
    return ctx.dataSource(ctx).request();
  }
  const error = new Error('Not found');
  return Promise.reject(Object.assign(error, { statusCode: 404 }));
}

function loopbackFilter(data, queryFilter) {
  return !Array.isArray(data) || !queryFilter ? data : applyFilter(data, queryFilter);
}

function validateStep(step, version, operationId, serviceId) {
  if (step === undefined) {
    logger.error(
      '[ERROR]',
      chalk.blueBright(`An step can not be undefined on ${serviceId}.${version}.${operationId}`)
    );
    throw new Error(`An step can not be undefined on ${serviceId}.${version}.${operationId}`);
  }
}

function findOperation(id, paths) {
  let schema;

  Object.keys(paths).some(pathKey =>
    Object.keys(paths[pathKey]).some(methodKey => {
      if (paths[pathKey][methodKey].operationId === id) {
        schema = { [pathKey]: { [methodKey]: paths[pathKey][methodKey] } };
        return true;
      }

      return false;
    })
  );

  return schema;
}

/**
 * An operation can be translated as an datasource function that can be used
 * every where to execute a flow of loaders and hooks.
 * @public
 * @class Operation
 * @param {string} id - the id of the operation
 * @param {function[]} steps - an array of steps to add to the operation
 * @param {Object} dataSourceTemplate - the operation datasource template definition, contains all the request data
 * @param {Object} apiDefinition - An [OpenAPI](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification) definition.
 * @param {Object} [serviceId] - the service name of the operation, only used for log purposes
 */
module.exports = class Operation {
  constructor(id, steps, dataSourceTemplate, apiDefinition, serviceId) {
    Object.defineProperties(this, {
      /** @memberof Operation#
       * @property {Object} private - Specify if the operation is private or not
       */
      private: {
        value: dataSourceTemplate.private,
        writable: true
      },
      /** @memberof Operation#
       * @property {Object} schema - operation OpenAPI schema
       */
      schema: {
        value: null,
        writable: true
      },
      validation: {
        value: {
          validateReqBuilder: null,
          validateResBuilder: null,
          validateReqEnabled: false,
          validateResEnabled: false
        },
        writable: true,
        enumerable: false
      },
      /**
       * @memberof Operation#
       * @property {Object} dataSource - the original operation datasource. Call this.dataSource(context) to get the compiled datasource template with the given context
       */
      dataSource: {
        value: buildDataSource(dataSourceTemplate),
        writable: false
      },
      /** @memberof Operation#
       * @property {Object} serviceId - the service id that this operation belongs
       */
      serviceId: {
        value: serviceId,
        writable: false
      },
      /** @memberof Operation#
       * @property {Object} operationId - the operation id
       */
      operationId: {
        value: id,
        writable: false
      },
      steps: {
        value: [],
        writable: false
      },
      /**
       * @memberof Operation#
       * @property {Object} apiDefinition - the complete API definition related to this operation
       */
      apiDefinition: {
        value: apiDefinition,
        writable: false
      },
      error: {
        value: {
          handler: err => Promise.reject(err)
        },
        writable: false
      }
    });
    if (apiDefinition) {
      const schema = findOperation(id, apiDefinition.paths);
      if (schema) {
        this.setSchema(schema);
      }
    }

    if (Array.isArray(steps) && steps.length > 0) {
      // If all given steps are instanceof Step, add them directly to steps
      if (steps.every(step => step instanceof Step)) {
        this.steps.splice(0);
        this.steps.push(...steps);
      } else if (steps.every(step => !(step instanceof Step))) {
        steps.forEach(step => this.push(step));
      } else {
        logger.warn('Instances of Steps with other types on create the operation can not be mixed');
      }
    }
  }

  /**
   * Push an step/function to the end of the chain
   * @param {any} step - the step function, value or class
   * @returns {Operation} an instance of the operation
   * @memberof Operation#
   * @example
   * //my-loader.js
   * const compileDataSource = require('bautajs/decorators/compile-data-source');
   *
   * module.exports = (services) => {
   *  // Step can be a function that returns a promise
   *  services.cats.v1.find.push((previousValue) => Promise.resolve('myValue'));
   *  // Step can be a function that returns a value
   *  services.cats.v1.find.push((previousValue, ctx) =>{
   *    const req = ctx.req;
   *    return 'value';
   *  });
   *  // Step can be a function that returns a callback
   *  services.cats.v1.find.push((previousValue , ctx, done) => done(null, 'myValue'));
   *  // Step can be a value
   *  services.cats.v1.find.push('value');
   *  // Step can have pseudo decorators
   *  services.cats.v1.find.push(compileDataSource((_ , ctx) => {
   *    return ctx.dataSource.request();
   *  });
   * }
   */
  push(step) {
    validateStep(
      step,
      this.apiDefinition.info.version,
      this.dataSource.template.id,
      this.serviceId
    );

    logger.debug(
      '[OK]',
      chalk.blueBright(`${this.serviceId}.${this.apiDefinition.info.version}
      .${this.dataSource.template.id} step registered on batuajs`)
    );
    logger.events.emit(logger.eventTypes.PUSH_STEP, { step, operation: this });

    this.steps.push(new Step(step));

    // Propagate the step to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.push(step);
    }

    return this;
  }

  /**
   * Set a custom error handler that will be executed in case of some loader is rejected
   * @param {function} errorHandler - the error handler function
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   *
   * services.cats.v1.find.setErrorHandler((err) => Promise.reject(err));
   */
  setErrorHandler(errorHandler) {
    if (typeof errorHandler !== 'function') {
      throw new Error(
        `The errorHandler must be a function, instead an ${typeof errorHandler} was found`
      );
    }

    this.error.handler = errorHandler;
    // Propagate the error handler to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.setErrorHandler(errorHandler);
    }

    return this;
  }

  /**
   * Enable or disable the request validation
   * @param {boolean} toggle - false to disable the request validation that is enabled by default
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   * conmst mySchema = require('./some-schema.json');
   *
   * services.cats.v1.find.validateRequest(false);
   */
  validateRequest(toggle) {
    this.validation.validateReqEnabled = toggle;

    return this;
  }

  /**
   * Enable or disable the response validation
   * @param {boolean} toggle - false to disable the response validation that is enabled by default
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   * conmst mySchema = require('./some-schema.json');
   *
   * services.cats.v1.find.validateResponse(false);
   */
  validateResponse(toggle) {
    this.validation.validateResEnabled = toggle;

    return this;
  }

  /**
   * Override the operation schema
   * @param {Object} schema - the [OpenAPI](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification) path schema @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object-example
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   * conmst mySchema = require('./some-schema.json');
   *
   * services.cats.v1.find.setSchema(mySchema);
   */
  setSchema(schema) {
    const error = validate(schema, apiPathSchema);
    if (error) {
      throw new Error(`Invalid schema, "${error[0].dataPath}" ${error[0].message}`);
    }
    const [endpointDefinition] = Object.values(Object.values(schema)[0]);
    // Determine OpenAPI version
    const schemas =
      !!this.apiDefinition.openapi && !!this.apiDefinition.components
        ? this.apiDefinition.components.schemas
        : this.apiDefinition.definitions;

    const validateRequest = new OpenAPIRequestValidator({
      ...endpointDefinition,
      schemas,
      ajvOptions: {
        nullable: true
      }
    });
    const validateResponse = new OpenAPIResponseValidator({
      ...endpointDefinition,
      components: { schemas },
      definitions: schemas
    });

    this.schema = schema;
    // BUG: https://github.com/kogosoftwarellc/open-api/issues/381
    const defaultSetter = new OpenAPIDefaultSetter({ parameters: [], ...endpointDefinition });
    this.validation.validateReqBuilder = req => {
      defaultSetter.handle(req);
      if (!req.headers) {
        // if is not a Nodejs request set the content-type to force validation
        req.headers = { 'content-type': 'application/json' };
      }

      const verror = validateRequest.validate(req);
      if (verror && verror.errors && verror.errors.length > 0) {
        throw new ValidationError(
          verror.message,
          verror.errors,
          verror.status === 400 ? 422 : verror.status
        );
      }

      return null;
    };
    this.validation.validateResBuilder = (res, statusCode = 200) => {
      const verror = validateResponse.validateResponse(statusCode, res);

      if (verror && verror.errors && verror.errors.length > 0) {
        throw new ValidationError(verror.message, verror.errors, verror.status, res);
      }

      return null;
    };
    if (
      this.apiDefinition.validateRequest === undefined ||
      this.apiDefinition.validateRequest === true
    ) {
      this.validateRequest(true);
    }

    if (
      this.apiDefinition.validateResponse === undefined ||
      this.apiDefinition.validateResponse === true
    ) {
      this.validateResponse(true);
    }

    // Propagate the definitions to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.setSchema(schema);
    }

    return this;
  }

  /**
   * Executes the current operation flow with the given context and initial data
   * The dataSource is only compiled on the loader step`
   * @param {Object} req - the context of the operation, usually the req object
   * @param {Object} res - the response object
   * @param {Object} [initialData= {}] - the initial data to execute the first flow step
   * @returns {Promise<object[]|object, Error>} resolves with the flow execution value, rejects with the flow execution error
   * @memberof Operation#
   * @async
   * @example
   * const { services } = require('bautajs');
   * const express = require('express');
   * const app = express();
   *
   * app.get('/blue', (req, res, next) => {
   *  services.cats.v1.find.exec(req, res).then((value) =>next(null, value)).catch(next);
   * })
   *
   */
  exec(req, res, initialData = {}) {
    const values = { ...initialData };
    const context = {
      validateRequest: request => this.validation.validateReqBuilder(request || req),
      validateResponse: this.validation.validateResBuilder,
      dataSource: this.dataSource,
      metadata: {
        version: this.dataSource.template.version,
        serviceId: this.serviceId,
        operationId: this.dataSource.template.id
      }
    };

    if (req) {
      Object.assign(context, { req, res, ...sessionFactory(req) });
    } else {
      throw new Error('The context(req) parameter is mandatory');
    }

    // Validate the request
    if (this.validation.validateReqEnabled === true) {
      context.validateRequest(req);
    }

    return this.run(0, values, context).catch(e => this.error.handler(e, context));
  }

  /**
   * Run the steps chain from the given step index
   * @param {number} index - the step index
   * @param {Object} value - the value to send to the step
   * @param {Object} context - the context to send to the step
   * @returns {Promise<object[]|object, Error>} resolves with the step execution value, rejects with the step execution error
   * @async
   * @memberof Operation#
   */
  run(index, value, context) {
    let promise;
    const step = this.steps[index];

    if (step instanceof Step) {
      // step instance
      promise = step.run(context, value);
    } else if (this.steps.length === 0) {
      promise = new Step(defaultResolver).run(context, value);
    } else {
      return Promise.resolve(value);
    }

    return promise.then(result => {
      // if res.send,res.json or res.end was called in the function chain, stop the chain.
      if (context.res && (context.res.headersSent || context.res.finished)) {
        return null;
      }

      if (index + 1 < this.steps.length) {
        return this.run(index + 1, result, context);
      }

      if (this.validation.validateResEnabled === true) {
        context.validateResponse(result, context.res ? context.res.statusCode : undefined);
      }

      // Apply loopback filter to the services that have the applyLoopackFilters toggle to true
      if (this.dataSource.template.applyLoopbackFilters === true) {
        return loopbackFilter(result, context.req.query && context.req.query.filter);
      }

      return result;
    });
  }
};
