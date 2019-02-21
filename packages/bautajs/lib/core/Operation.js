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
const chalk = require('chalk');
const applyFilter = require('loopback-filters');
const OpenAPIRequestValidator = require('openapi-request-validator').default;
const OpenAPIDefaultSetter = require('openapi-default-setter').default;
const OpenAPIResponseValidator = require('openapi-response-validator').default;

const validate = require('../validators/validate');
const apiPathSchema = require('../validators/api-path-schema.json');
const logger = require('../logger');
const Step = require('./Step');
const Fork = require('./Fork');
const buildDataSource = require('../request/datasource');
const sessionFactory = require('../session-factory');

function isValidStepChain(steps) {
  return !steps
    .slice()
    .reverse()
    .some(s => s.type === 'join');
}

function loopbackFilter(data, queryFilter) {
  return !Array.isArray(data) || !queryFilter ? data : applyFilter(data, queryFilter);
}

function validateStep(step, version, operationId, serviceId) {
  if (step === undefined) {
    logger.error(
      '[ERROR]',
      chalk.blueBright(
        `An step loader can not be undefined on ${serviceId}.${version}.${operationId}`
      )
    );
    throw new Error(
      `An step loader can not be undefined on ${serviceId}.${version}.${operationId}`
    );
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
       * @property {Object} schema - operation OpenAPI schema
       */
      schema: {
        value: null,
        writable: true
      },
      /**
       * Validate the given request.
       * @param {any} [req] - the request object. If not set the given context request will be validated.
       * @throw {Error} a 400 error if the given request is not valid
       * @memberof Operation#
       * @example
       * const { services } = require('bautajs');
       *
       * services.cats.v1.find.previous(function(previousValue){
       *  const error = this.validateRequest();
       *  if(error) {
       *    throw error;
       *  }
       *
       *  return 'value';
       * });
       */
      validateRequest: {
        value: null,
        writable: true
      },
      /**
       * Validate the given response
       * @param {any} response - the response object.
       * @throw {Error} a 500 error if the given response is not valid
       * @memberof Operation#
       * @example
       * const { services } = require('bautajs');
       *
       * services.cats.v1.find.next(function(response){
       *  const error = this.validateResponse(response);
       *  if(error) {
       *    this.logger.error(`Error on validate the response ${error}`);
       *    throw error;
       *  }
       *
       *  return 'value';
       * });
       */
      validateResponse: {
        value: null,
        writable: true
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
      steps: {
        value: [],
        writable: false
      },
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
        // Set the operation loader first
        this.setLoader(steps[0]);

        // Add the next operations
        steps.slice(1, steps.length).forEach(step => this.next(step));
      } else {
        logger.warn('You can not mix instances of Steps with other types on create the operation');
      }
    }
  }

  /**
   * Set a custom loader for the operation.
   * `This will keep the steps chain order previously created.`
   * `Carefully do not use arrow functions if you want to access to the loader "this" context`
   * `The req object updates in this phase can not be getted from the datasource`
   * @param {any} loader - the loader function, value or class
   * @returns {Operation} an instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   *
   * // Loader can be a function that returns a promise
   * services.cats.v1.find.setLoader((previousValue) => Promise.resolve('myValue'));
   * // Loader can be a function that returns a value
   * services.cats.v1.find.setLoader(function(previousValue){
   *  const req = this.req;
   *  return 'value';
   * });
   * // Loader can be a function that returns a callback
   * services.cats.v1.find.setLoader((previousValue, done) => done(null, 'myValue'));
   * // Loader can be a value
   * services.cats.v1.find.setLoader('value');
   */
  setLoader(loader) {
    validateStep(
      loader,
      this.apiDefinition.info.version,
      this.dataSource.template.id,
      this.serviceId
    );

    logger.debug(
      '[OK]',
      chalk.blueBright(`${this.serviceId}.${this.apiDefinition.info.version}
      .${this.dataSource.template.id} loader step registered on batuajs`)
    );

    const loaderIndex = this.steps.findIndex(step => step.type === 'loader');
    this.steps.splice(loaderIndex, 1, new Step(loader, 'loader'));

    // Propagate the loader to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.setLoader(loader);
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
      schemas
    });
    const validateResponse = new OpenAPIResponseValidator({
      ...endpointDefinition,
      definitions: schemas
    });

    this.schema = schema;
    const defaultSetter = new OpenAPIDefaultSetter(endpointDefinition);
    this.validateRequest = req => {
      defaultSetter.handle(req);
      if (!req.headers) {
        // if is not a Nodejs request set the content-type to force validation
        req.headers = { 'content-type': 'application/json' };
      }
      const verror = validateRequest.validate(req);
      if (verror && verror.errors.length > 0) {
        return Object.assign(
          new Error(`${verror.errors[0].path || ''} ${verror.errors[0].message}`.trim()),
          verror
        );
      }

      return null;
    };
    this.validateResponse = (res, statusCode = 200) =>
      validateResponse.validateResponse(statusCode, res);

    // Propagate the definitions to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.setSchema(schema);
    }

    return this;
  }

  /**
   * Set a before loader hook. You can add as many as you want. The step will be added at the tail
   * of the previous steps queue.
   * `P1 -> P2 -> P3(new) -> Loader -> N1 -> N2`
   * `Carefully do not use arrow functions if you want to access to the loader this context`
   * @param {any} step - the step to add to the previous steps queue. It's a function that receives
   * the previous step result and returns a promise, a value or a callback
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   *
   * // Previous step can be a function that returns a promise
   * services.cats.v1.find.previous((previousValue) => Promise.resolve('myValue'));
   * // Previous step can be a function that returns a value
   * services.cats.v1.find.previous((previousValue) => 'value');
   * // Previous step can be a function that returns a callback
   * services.cats.v1.find.previous((previousValue, done) => done(null, 'myValue'));
   * // Previous step can be a value
   * services.cats.v1.find.previous('value');
   * // Hooks can be chained, keep the order of execution as the declaration order.
   * services.cats.v1.find.previous((previousValue, done) => {
   *  // previousValue = 'value1';
   *  return done(null, previousValue);
   * }).previous('value1')
   */
  previous(step) {
    validateStep(
      step,
      this.apiDefinition.info.version,
      this.dataSource.template.id,
      this.serviceId
    );

    logger.debug(
      '[OK]',
      chalk.blueBright(`${this.serviceId}.${this.apiDefinition.info.version}
      .${this.dataSource.template.id} previous hook step registered on bautajs`)
    );
    const loaderIndex = this.steps.findIndex(s => s.type === 'loader');
    this.steps.splice(loaderIndex, 0, new Step(step, 'previous'));

    // Propagate the previous hook to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.previous(step);
    }

    return this;
  }

  /**
   * Set a after loader hook. You can add as many as you want. The step will be added at the tail
   * of the next steps queue.
   * `P1 -> P2 -> Loader -> N1 -> N2 -> N3(new)`
   * `Carefully do not use arrow functions if you want to access to the loader this context`
   * @param {any} step - the step to execute at the tail of the next steps queue. It's a function that receives
   * the previous step result and returns a promise, a value or a callback
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   *
   * // next step can be a function that returns a promise
   * services.cats.v1.find.next((previousValue) => Promise.resolve('myValue'));
   * // next step can be a function that returns a value
   * services.cats.v1.find.next((previousValue) => 'value');
   * // next step can be a function that returns a callback
   * services.cats.v1.find.next((previousValue, done) => done(null, 'myValue'));
   * // next step can be a value
   * services.cats.v1.find.next('value');
   * // Hooks can be chained.
   * services.cats.v1.find.next('value1').next((previousValue, done) => {
   *  // previousValue = 'value1';
   *  return done(null, previousValue)
   * }).next('value1')
   */
  next(step) {
    validateStep(
      step,
      this.apiDefinition.info.version,
      this.dataSource.template.id,
      this.serviceId
    );

    logger.debug(
      '[OK]',
      chalk.blueBright(`${this.serviceId}.${this.apiDefinition.info.version}
      .${this.dataSource.template.id} next hook step registered on bautajs`)
    );

    this.steps.push(new Step(step, 'next'));

    // Propagate the next hook to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.next(step);
    }

    return this;
  }

  /**
   * Set a middleware before all the other hooks and loader. You can add as many as you want. The step will be added as the first executable function.
   * `MW2(new) -> MW1 -> P1 -> P2-> Loader -> N1 -> N2`
   * `Carefully do not use arrow functions if you want to access to the middleware this context`
   * The difference between this and the previus hooks are that this could be used at a service level as a previus step before all other hooks.
   * @param {any} step - the step to add to the first index of steps queue. It's a function that receives
   * the middleware step result and returns a promise, a value or a callback
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   *
   * // Middleware step can be a function that returns a promise
   * services.cats.v1.find.addMiddleware((previousValue) => Promise.resolve('myValue'));
   * // Middleware step can be a function that returns a value
   * services.cats.v1.find.addMiddleware((previousValue) => 'value');
   * // Middleware step can be a function that returns a callback
   * services.cats.v1.find.addMiddleware((previousValue, done) => done(null, 'myValue'));
   * // Middleware step can be a value
   * services.cats.v1.find.addMiddleware('value');
   * // Middlewares can be chained, keep the order of execution as the declaration order.
   * services.cats.v1.find.addMiddleware((previousValue, done) => {
   *  // previousValue = 'value1';
   *  return done(null, previousValue);
   * }).addMiddleware('value1')
   */
  addMiddleware(step) {
    validateStep(
      step,
      this.apiDefinition.info.version,
      this.dataSource.template.id,
      this.serviceId
    );

    logger.debug(
      '[OK]',
      chalk.blueBright(`${this.serviceId}.${this.apiDefinition.info.version}
      .${this.dataSource.template.id} middleware step registered on bautajs`)
    );

    let firstIndex = this.steps.findIndex(s => s.type === 'previous');
    if (firstIndex < 0) {
      firstIndex = this.steps.findIndex(s => s.type === 'loader');
    }

    this.steps.splice(firstIndex, 0, new Step(step, 'middleware'));

    // Propagate the next hook to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.addMiddleware(step);
    }

    return this;
  }

  /**
   * Set a parallel flow in to your operation flow that resolves all the next steps in parallel
   * @param {function|object[]|string[]|number[]} iterable - an iterable function that returns an array of values or an array of values
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   * @example
   * const { services } = require('bautajs');
   *
   * services.cats.v1.find.fork(['value1','value2'])
   * // The next hooks will be executed in parallel for value1 and value2 separately
   * .next((previousValue) =>{
   * // previousValue = 'value1'
   *  return previousValue
   * })
   * // This will merge the two streams
   * .join()
   * .next((previousValue) => {
   * // previousValue = ['value1','value2'];
   *
   * return previousValue
   * })
   */
  fork(iterable) {
    logger.debug(
      '[OK]',
      chalk.blueBright(`${this.serviceId}.${this.apiDefinition.info.version}
      .${this.dataSource.template.id} fork hook step registered on bautajs`)
    );

    this.steps.push(new Fork(iterable));

    // Propagate the fork hook to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.fork(iterable);
    }

    return this;
  }

  /**
   * Join the fork stream to the parent flow chain
   * @returns {Operation} An instance of the operation
   * @memberof Operation#
   */
  join() {
    logger.debug(
      '[OK]',
      chalk.blueBright(`${this.serviceId}.${this.apiDefinition.info.version}
      .${this.dataSource.template.id} join hook step registered on bautajs`)
    );

    if (!isValidStepChain(this.steps)) {
      throw new Error(`The join step should be used after a fork step. Ex: fork -> next -> join`);
    }

    this.steps.push(new Step(values => values, 'join'));

    if (this.steps[this.steps.length - 2].type === 'fork') {
      throw new Error(
        `The join step can't be next to a fork step, please add steps in between. Ex: fork -> next -> join`
      );
    }

    // Propagate the join hook to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.join();
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
    const values = Object.assign({}, initialData);
    const context = {
      validateRequest: request => this.validateRequest(request || req),
      validateResponse: response => this.validateResponse(response),
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
    if (this.schema && this.dataSource.template.validateRequest === true) {
      const error = this.validateRequest(req);
      if (error) {
        throw error;
      }
    }

    return this.run(0, values, context);
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

    // Only compile the operation datasource when the step 'loader' is executed.

    if (step && step.type === 'loader') {
      Object.assign(context, {
        dataSource: this.dataSource(context.req)
      });
    }

    if (step instanceof Fork) {
      // find the next join on the chain to stop the fork execution
      const joinIndex = this.steps.findIndex((s, i) => i > index && s.type === 'join');

      let until = this.steps.length - 1;
      if (joinIndex > -1) {
        until = joinIndex - index;
      }
      const chain = new Operation(
        this.operationId,
        this.steps.splice(index + 1, until),
        this.dataSource,
        this.apiDefinition,
        this.serviceId
      );

      const promises = this.constructor.runFork(step, chain, value, context);
      promise = Promise.all(promises);
    } else if (step instanceof Operation) {
      promise = step.run(0, value, context);
    } else if (step) {
      // step instance
      promise = step.run(context, value);
    } else {
      promise = new Promise(resolve => resolve(null));
    }

    return promise
      .then(result => {
        if (index + 1 < this.steps.length) {
          return this.run(index + 1, result, context);
        }

        if (this.schema && this.dataSource.template.validateResponse) {
          const error = this.validateResponse(
            result,
            context.res ? context.res.statusCode : undefined
          );
          if (error && error.errors.length > 0) {
            throw error.errors;
          }
        }

        // Apply loopback filter to the services that have the applyLoopackFilters toggle to true
        if (this.dataSource.template.applyLoopbackFilters === true) {
          return loopbackFilter(result, context.req.query && context.req.query.filter);
        }

        return result;
      })
      .catch(this.error.handler.bind(context));
  }

  /**
   * Run the given fork chain
   * @param {Fork} fork - a fork instance
   * @param {Operation} chain - the fork chain of steps
   * @param {Object} value - the last step values
   * @returns {Promise<object[], Error>} resolves with the array of values from the given fork execution, reject with the fork error execution
   * @async
   * @memberof Operation#
   */
  static runFork(fork, chain, value, context) {
    let result;
    const promises = [];
    fork.initIterator(context, value);
    do {
      result = fork.nextValue();
      if (result) {
        promises.push(chain.run(0, result, context));
      }
    } while (result);

    return promises;
  }
};
