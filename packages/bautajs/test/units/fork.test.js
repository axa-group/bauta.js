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
/* global expect, describe, test */

const Fork = require('../../lib/core/Fork');

describe('Fork class tests', () => {
  describe('constructor tests', () => {
    test('should throw an error if the given iterable is not a function', () => {
      const expected = new Error('The fork input must be an array or an function');

      expect(() => new Fork('string')).toThrow(expected);
    });

    test('should throw an error if the given iterable reached the limit of iterations', () => {
      const expected = new Error('Fork limit reached, max 20');
      const iterable = new Array(30);

      expect(() => new Fork(iterable)).toThrow(expected);
    });
  });

  describe('Fork.initIterator tests', () => {
    test('should throw an error if the iterator result gives an interator that reach the limit of iterations', () => {
      const iterable = new Array(30);
      const fork = new Fork(() => iterable);
      const expected = new Error('Fork limit reached, max 20');

      expect(() => fork.initIterator({}, 1)).toThrow(expected);
    });

    test('should throw an error if the given iterator is not valid', () => {
      const fork = new Fork(() => null);
      const expected = new Error('Invalid iterator for forking');

      expect(() => fork.initIterator({}, 1)).toThrow(expected);
    });
  });

  describe('Fork.initIterator tests', () => {
    test('should throw an error if the iterator result gives an interator that reach the limit of iterations', () => {
      const iterable = new Array(30);
      const fork = new Fork(() => iterable);
      const expected = new Error('Fork limit reached, max 20');

      expect(() => fork.initIterator({}, 1)).toThrow(expected);
    });

    test('should throw an error if the given iterator is not valid', () => {
      const fork = new Fork(() => null);
      const expected = new Error('Invalid iterator for forking');

      expect(() => fork.initIterator({}, 1)).toThrow(expected);
    });
  });

  describe('Fork.nextValue tests', () => {
    test('should execute the iterator if is a function and iterate over the result', () => {
      const fork = new Fork(() => [1, 2]);
      fork.initIterator({}, 1);

      expect(fork.nextValue()).toEqual(2);
      expect(fork.nextValue()).toEqual(1);
    });

    test('should execute the iterator if has next iterator method', () => {
      const values = [1, 2];
      const iterator = function iteratorFn() {
        return {
          next: () => values.pop()
        };
      };
      const fork = new Fork(iterator);
      fork.initIterator({}, 1);

      expect(fork.nextValue()).toEqual(2);
      expect(fork.nextValue()).toEqual(1);
    });

    test('should execute the iterator if has pop iterator method', () => {
      const values = [1, 2];
      const iterator = function iteratorFn() {
        return {
          pop: () => values.pop()
        };
      };
      const fork = new Fork(iterator);
      fork.initIterator({}, 1);

      expect(fork.nextValue()).toEqual(2);
      expect(fork.nextValue()).toEqual(1);
    });

    test('should execute the iterator if the function returns an non iterable element and return null', () => {
      const fork = new Fork(() => 'string');
      fork.initIterator({}, 1);

      expect(fork.nextValue()).toEqual(null);
    });

    test('should execute the iterator if the function returns another function', () => {
      const fork = new Fork(() => () => [1]);
      fork.initIterator({}, 1);

      expect(fork.nextValue()).toEqual([1]);
    });
  });
});
