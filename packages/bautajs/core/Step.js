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

/**
 * An Step instance is the representation of a function or a value. Is the smallest item of the chain.
 * The step gets as parameter the context and the previous step value and returns a promise a value or a callback.
 * @public
 * @class Step
 * @param {function} step - a function that returns a promise
 */
module.exports = class Step {
  constructor(step) {
    this.step = step;
  }

  /**
   * Run the step binding the given context and adding the given value, making accessible the context (req) by 'this'
   * inside the step function.
   * The step always returns a promise, but inside the step function you can return a value, promise or a callback.
   * @param {Object} ctx - the context bind to the step execution
   * @param {Object} value - the input value to send to the step execution
   * @returns {{Promise<object[]|object, Error>}} resolves with the step result, rejects with the step error
   * @memberof Step#
   * @async
   */
  run(ctx, value) {
    let promise;

    if (typeof this.step === 'function') {
      promise =
        this.step.length > 2 ? this.runWithCallback(ctx, value) : this.runWithReturn(ctx, value);
    } else {
      // step is a promise or a value
      promise = this.constructor.handleValue(this.step);
    }

    return promise;
  }

  /**
   * Execute the step and convert the callback returned into a promise
   * @param {Object} ctx - the context bind to the step execution
   * @param {Object} value - the input value to send to the step execution
   * @returns {Promise<object[]|object, Error>} resolves with the step result, rejects with the step error
   * @memberof Step#
   * @async
   */
  runWithCallback(ctx, value) {
    return new Promise((resolve, reject) => {
      this.step(
        value,
        ctx,
        (err, result) => {
          if (err instanceof Error) {
            reject(err);
          }
          resolve(err || result);
        },
        reject
      );
    });
  }

  /**
   * Execute the step and covnert the simple result returned into a promise
   * @param {Object} ctx - the context bind to the step execution
   * @param {Object} value - the input value to send to the step execution
   * @returns {Promise<object[]|object, Error>} resolves with the step result, rejects with the step error
   * @memberof Step#
   * @async
   */
  runWithReturn(ctx, value) {
    const result = this.step(value, ctx);
    return this.constructor.handleValue(result);
  }

  /**
   * Return the step as a promise
   * @param {Object} value - the input value to send as a result
   * @returns {Promise<object[]|object, Error>} resolves with the step result, rejects with the step error
   * @memberof Step#
   * @async
   */
  static handleValue(value) {
    if (value instanceof Object && 'then' in value) {
      return value;
    }

    return new Promise(resolve => resolve(value));
  }
};
