
Native Proxy Agent
------------------

A native proxy agent that uses the native nodejs http.Agent and https.Agent to proxy the requests, no dependencies

How to install
--------------

Make sure that you have access to [Artifactory](https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/)

```console
  npm install native-proxy-agent
```

Usage
-----

```js
const { createAgent } = require('native-proxy-agent');
const got = require('got');

 got('http://requestUrl.com/service/1', { agent : createAgent('http://requestUrl.com/service/1') });
```

## Index

### Classes

* [HttpAgent](classes/httpagent.md)
* [HttpsAgent](classes/httpsagent.md)

### Interfaces

* [HttpProxy](interfaces/httpproxy.md)
* [HttpsProxy](interfaces/httpsproxy.md)
* [ICallback](interfaces/icallback.md)
* [NativeHttpAgentOptions](interfaces/nativehttpagentoptions.md)
* [NativeHttpsAgentOptions](interfaces/nativehttpsagentoptions.md)

### Type aliases

* [NativeAgentOptions](#nativeagentoptions)

### Functions

* [createAgent](#createagent)

---

## Type aliases

<a id="nativeagentoptions"></a>

###  NativeAgentOptions

**Ƭ NativeAgentOptions**: *[NativeHttpAgentOptions](interfaces/nativehttpagentoptions.md) \| [NativeHttpsAgentOptions](interfaces/nativehttpsagentoptions.md)*

*Defined in [types.ts:48](https://github.axa.com/Digital/bauta-nodejs/blob/c21a44f/packages/native-proxy-agent/src/types.ts#L48)*

___

## Functions

<a id="createagent"></a>

###  createAgent

▸ **createAgent**(target: *`string`*, options?: *[NativeAgentOptions](#nativeagentoptions)*): [HttpsAgent](classes/httpsagent.md) \| [HttpAgent](classes/httpagent.md)

*Defined in [agent.ts:33](https://github.axa.com/Digital/bauta-nodejs/blob/c21a44f/packages/native-proxy-agent/src/agent.ts#L33)*

Get the needed proxy agent depending of the given proxy options and target. Also try to gets the proxy from the http/s\_proxy env variables

*__example__*: const { createAgent } = require('native-proxy-agent'); const got = require('got');

got('[http://myhost.com'](http://myhost.com'), { agent : createAgent('[http://myhost.com'](http://myhost.com')) });

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| target | `string` | - |  The target to proxy |
| `Default value` options | [NativeAgentOptions](#nativeagentoptions) |  {} |

**Returns:** [HttpsAgent](classes/httpsagent.md) \| [HttpAgent](classes/httpagent.md)
The agent depending on the target.

___

