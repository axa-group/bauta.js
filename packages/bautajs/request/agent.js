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
const nodeHash = require('node-object-hash')({ coerce: { set: true, symbol: true } });
const { createHttpAgent, createHttpsAgent } = require('native-proxy-agent');

let agentStorage = {};

/**
 * Create an agent and save it to reuse.
 *  - If exist an agent with same options return the agent.
 *  - Else create a new agent.
 */
function createAgent(url, agentOptions) {
  const hashKey = nodeHash.hash(agentOptions);
  if (agentStorage[hashKey]) {
    return agentStorage[hashKey];
  }

  const agent = url.includes('https')
    ? createHttpsAgent(agentOptions)
    : createHttpAgent(agentOptions);
  agentStorage[hashKey] = agent;

  return agent;
}

function clearAgentStoreage() {
  agentStorage = {};
}

module.exports = {
  createAgent,
  clearAgentStoreage
};
