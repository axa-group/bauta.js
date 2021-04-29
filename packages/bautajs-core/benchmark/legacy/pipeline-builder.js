'use strict';
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
/**
 * File with legacy pipeline builder. It's only needed for benchmark propose.
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.Builder = void 0;
const accessor_1 = require('./accessor');
class Builder {
  constructor(accessor = new accessor_1.Accessor(), onPush) {
    this.accessor = accessor;
    this.onPush = onPush;
    // eslint-disable-next-line no-empty-function
  }
  onError(fn) {
    if (typeof fn !== 'function') {
      throw new Error('The errorHandler must be a function.');
    }
    this.accessor.errorHandler = fn;
  }
  push(fn) {
    this.accessor.handler = this.merge(this.accessor.handler, fn);
    if (this.onPush) {
      this.onPush(fn);
    }
    return new Builder(this.accessor, this.onPush);
  }
  pipe(...fns) {
    if (fns.length === 0) {
      throw new Error('At least one Pipeline.StepFunction must be specified.');
    }
    if (!fns.every(fn => typeof fn === 'function')) {
      throw new Error('A Pipeline.StepFunction must be a function.');
    }
    fns.forEach(fn => this.push(fn));
    return new Builder(this.accessor, this.onPush);
  }
  // eslint-disable-next-line class-methods-use-this
  merge(fn1, fn2) {
    return (prev, ctx, bautajs) => {
      const res = fn1(prev, ctx, bautajs);
      if (res instanceof Promise) {
        return res.then(r => fn2(r, ctx, bautajs));
      }
      return fn2(res, ctx, bautajs);
    };
  }
}
exports.Builder = Builder;
exports.default = Builder;
//# sourceMappingURL=pipeline-builder.js.map
