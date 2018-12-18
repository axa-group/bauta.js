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

function isForkLimitReached(steps) {
  return Array.isArray(steps) && steps.length > 20;
}

/**
 * A fork instance is a sub chain of steps that run in parallel inside the current chain
 * @public
 * @class Fork
 * @param {function|any[]} iterable - an iterable function that returns an array of values or an array of values
 */
module.exports = class Fork {
  constructor(iterable) {
    if (!Array.isArray(iterable) && typeof iterable !== 'function') {
      throw new Error('The fork input must be an array or an function');
    }

    if (isForkLimitReached(iterable)) {
      throw new Error('Fork limit reached, max 20');
    }

    this.iterable = iterable;
    this.type = 'fork';
  }

  /**
   * Initialize the fork iterator, the limit items for the iterable is 20
   * @param {Object} context - the given context of the flow
   * @param {Object} value - the last value before the fork
   * @throws {Error} if the fork limit is reached or the iterator is not valid
   * @memberof Fork#
   */
  initIterator(context, value) {
    if (this.iterable instanceof Function) {
      this.iterator = this.iterable.call(context, value);
      if (isForkLimitReached(this.iterator)) {
        throw new Error('Fork limit reached, max 20');
      }
    } else {
      this.iterator = this.iterable;
    }
    if (!this.iterator) {
      throw new Error('Invalid iterator for forking');
    }
  }

  /**
   * Get the next value of the iterator
   * @returns {null|any} the next iterator value
   * @memberof Fork#
   */
  nextValue() {
    if (this.iterator instanceof Function) {
      return this.iterator();
    }
    if (typeof this.iterator !== 'string' && typeof this.iterator !== 'number') {
      if ('next' in this.iterator) {
        return this.iterator.next();
      }
      if ('pop' in this.iterator) {
        return this.iterator.pop();
      }
    }

    return null;
  }
};
