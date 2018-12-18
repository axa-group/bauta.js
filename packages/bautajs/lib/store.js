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
 * A store instance, use it to add global instances accesible from every where on your app.
 * @name store
 * @constant {Map}
 * @example
 * // fileA.js
 * const { store } = require('bautajs');
 *
 * const myInstance = newInstance();
 *
 * store.set('myInstance', myInstance);
 *
 * // fileb.js
 * const { store } = require('bautajs');
 *
 * const myInstance = store.get('myInstance');
 */
module.exports = new Map();
