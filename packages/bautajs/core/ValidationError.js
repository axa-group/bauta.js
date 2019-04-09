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

/**
 * The validation error object
 * @public
 * @class ValidationError
 * @extends Error
 * @param {string} message - the error message
 * @param {{location, message}[]} errors - an array of validation errors
 * @param {number} statusCode - The error status code
 * @param {Object} response - The response validated
 */
module.exports = class ValidationError extends Error {
  constructor(message, errors, statusCode = 500, response) {
    super(message);
    /** @memberof ValidationError#
     * @property {{location, message}[]} errors - an array of validation errors
     */
    this.errors = errors;
    /** @memberof ValidationError#
     * @property {number} statusCode - The error status code
     */
    this.statusCode = statusCode;
    /** @memberof ValidationError#
     * @property {Object} response - The response validated
     */
    this.response = response;
    Error.captureStackTrace(this, ValidationError);
  }
};
