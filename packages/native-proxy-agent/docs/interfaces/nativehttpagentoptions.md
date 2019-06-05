[native-proxy-agent](../README.md) > [NativeHttpAgentOptions](../interfaces/nativehttpagentoptions.md)

# Interface: NativeHttpAgentOptions

## Hierarchy

 `AgentOptions`

**↳ NativeHttpAgentOptions**

## Index

### Properties

* [headers](nativehttpagentoptions.md#headers)
* [httpThroughProxy](nativehttpagentoptions.md#httpthroughproxy)
* [keepAlive](nativehttpagentoptions.md#keepalive)
* [keepAliveMsecs](nativehttpagentoptions.md#keepalivemsecs)
* [maxFreeSockets](nativehttpagentoptions.md#maxfreesockets)
* [maxSockets](nativehttpagentoptions.md#maxsockets)
* [proxy](nativehttpagentoptions.md#proxy)
* [timeout](nativehttpagentoptions.md#timeout)

---

## Properties

<a id="headers"></a>

### `<Optional>` headers

**● headers**: *`any`*

*Defined in [types.ts:38](https://github.axa.com/Digital/bauta-nodejs/blob/c21a44f/packages/native-proxy-agent/src/types.ts#L38)*

___
<a id="httpthroughproxy"></a>

### `<Optional>` httpThroughProxy

**● httpThroughProxy**: *`undefined` \| `false` \| `true`*

*Defined in [types.ts:39](https://github.axa.com/Digital/bauta-nodejs/blob/c21a44f/packages/native-proxy-agent/src/types.ts#L39)*

___
<a id="keepalive"></a>

### `<Optional>` keepAlive

**● keepAlive**: *`undefined` \| `false` \| `true`*

*Inherited from AgentOptions.keepAlive*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:212*

Keep sockets around in a pool to be used by other requests in the future. Default = false

___
<a id="keepalivemsecs"></a>

### `<Optional>` keepAliveMsecs

**● keepAliveMsecs**: *`undefined` \| `number`*

*Inherited from AgentOptions.keepAliveMsecs*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:217*

When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000. Only relevant if keepAlive is set to true.

___
<a id="maxfreesockets"></a>

### `<Optional>` maxFreeSockets

**● maxFreeSockets**: *`undefined` \| `number`*

*Inherited from AgentOptions.maxFreeSockets*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:225*

Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.

___
<a id="maxsockets"></a>

### `<Optional>` maxSockets

**● maxSockets**: *`undefined` \| `number`*

*Inherited from AgentOptions.maxSockets*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:221*

Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity

___
<a id="proxy"></a>

### `<Optional>` proxy

**● proxy**: *[HttpProxy](httpproxy.md) \| [HttpProxy](httpproxy.md)*

*Defined in [types.ts:37](https://github.axa.com/Digital/bauta-nodejs/blob/c21a44f/packages/native-proxy-agent/src/types.ts#L37)*

___
<a id="timeout"></a>

### `<Optional>` timeout

**● timeout**: *`undefined` \| `number`*

*Inherited from AgentOptions.timeout*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:229*

Socket timeout in milliseconds. This will set the timeout after the socket is connected.

___

