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
import * as http from 'http';
import * as https from 'https';
import { TcpSocketConnectOpts } from 'net';
import { ConnectionOptions } from 'tls';

export interface ICallback {
  (error?: Error | null, result?: any): void;
}

export interface HttpsProxy extends ConnectionOptions {
  headers?: any;
  auth?: any;
  protocol?: string;
}

export interface HttpProxy extends TcpSocketConnectOpts {
  headers?: any;
  auth?: any;
  protocol?: string;
}

export interface NativeHttpAgentOptions extends http.AgentOptions {
  proxy?: HttpProxy | HttpProxy;
  headers?: any;
  httpThroughProxy?: boolean;
}

export interface NativeHttpsAgentOptions extends https.AgentOptions {
  proxy?: HttpProxy | HttpProxy;
  headers?: any;
  hostname?: string;
}

export type NativeAgentOptions = NativeHttpAgentOptions | NativeHttpsAgentOptions;
