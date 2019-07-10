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
/* global expect, describe, test */
// eslint-disable-next-line no-unused-vars
import deepmerge from 'deepmerge';
import { isMergeableObject } from '../utils/is-mergeable-object';

describe('Merge datasources', () => {
  test('should merge two objects versions', () => {
    const ds1 = {
      services: { test: { operations: [{ a: 'hi' }, { b: 'bender' }] } }
    };
    const ds2 = {
      services: {
        test: {
          operations: [{ a: 'hi', versionId: 'v2' }, { b: 'bender', versionId: 'v2' }]
        }
      }
    };
    const expected = {
      services: {
        test: {
          operations: [
            { a: 'hi' },
            { b: 'bender' },
            { a: 'hi', versionId: 'v2' },
            { b: 'bender', versionId: 'v2' }
          ]
        }
      }
    };

    expect(deepmerge(ds1, ds2, { isMergeableObject })).toEqual(expected);
  });

  test('should merge two different services', () => {
    const ds1 = {
      services: { test: { operations: [{ a: 'hi' }, { b: 'bender' }] } }
    };
    const ds2 = {
      services: {
        test2: {
          operations: [{ a: 'hi', versionId: 'v2' }, { b: 'bender', versionId: 'v2' }]
        }
      }
    };
    const expected = {
      services: {
        test: {
          operations: [{ a: 'hi' }, { b: 'bender' }]
        },
        test2: {
          operations: [{ a: 'hi', versionId: 'v2' }, { b: 'bender', versionId: 'v2' }]
        }
      }
    };

    expect(deepmerge(ds1, ds2, { isMergeableObject })).toEqual(expected);
  });

  test('should merge two different global options', () => {
    const ds1 = {
      services: {
        test: { options: { a: 2 }, operations: [{ a: 'hi' }, { b: 'bender' }] }
      }
    };
    const ds2 = {
      services: {
        test: {
          options: { a: 3, b: 4 },
          operations: [{ a: 'hi', versionId: 'v2' }, { b: 'bender', versionId: 'v2' }]
        }
      }
    };
    const expected = {
      services: {
        test: {
          options: { a: 3, b: 4 },
          operations: [
            { a: 'hi' },
            { b: 'bender' },
            { a: 'hi', versionId: 'v2' },
            { b: 'bender', versionId: 'v2' }
          ]
        }
      }
    };

    expect(deepmerge(ds1, ds2, { isMergeableObject })).toEqual(expected);
  });
  test('should merge two different datasources without lose the not plain objects', () => {
    const ds1 = {
      services: {
        test: { options: { a: 2 }, operations: [{ a: 'hi' }, { b: 'bender' }] }
      }
    };
    const ds2 = {
      services: {
        test: {
          options: { a: 3, b: 4, cache: new Map() },
          operations: [{ a: 'hi', versionId: 'v2' }, { b: 'bender', versionId: 'v2' }]
        }
      }
    };
    const expected = {
      services: {
        test: {
          options: { a: 3, b: 4, cache: new Map() },
          operations: [
            { a: 'hi' },
            { b: 'bender' },
            { a: 'hi', versionId: 'v2' },
            { b: 'bender', versionId: 'v2' }
          ]
        }
      }
    };

    expect(deepmerge(ds1, ds2, { isMergeableObject })).toEqual(expected);
  });
});
