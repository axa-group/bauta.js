[native-proxy-agent](../README.md) > [HttpsAgent](../classes/httpsagent.md)

# Class: HttpsAgent

## Hierarchy

 `Agent`

**↳ HttpsAgent**

## Index

### Constructors

* [constructor](httpsagent.md#constructor)

### Properties

* [maxFreeSockets](httpsagent.md#maxfreesockets)
* [maxSockets](httpsagent.md#maxsockets)
* [options](httpsagent.md#options)
* [requests](httpsagent.md#requests)
* [sockets](httpsagent.md#sockets)

### Methods

* [createConnection](httpsagent.md#createconnection)
* [destroy](httpsagent.md#destroy)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new HttpsAgent**(options?: *`AgentOptions`*): [HttpsAgent](httpsagent.md)

*Inherited from Agent.__constructor*

*Overrides Agent.__constructor*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/https.d.ts:19*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` options | `AgentOptions` |

**Returns:** [HttpsAgent](httpsagent.md)

___

## Properties

<a id="maxfreesockets"></a>

###  maxFreeSockets

**● maxFreeSockets**: *`number`*

*Inherited from Agent.maxFreeSockets*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:233*

___
<a id="maxsockets"></a>

###  maxSockets

**● maxSockets**: *`number`*

*Inherited from Agent.maxSockets*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:234*

___
<a id="options"></a>

###  options

**● options**: *`AgentOptions`*

*Inherited from Agent.options*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/https.d.ts:21*

___
<a id="requests"></a>

###  requests

**● requests**: *`object`*

*Inherited from Agent.requests*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:238*

#### Type declaration

[key: `string`]: `IncomingMessage`[]

___
<a id="sockets"></a>

###  sockets

**● sockets**: *`object`*

*Inherited from Agent.sockets*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:235*

#### Type declaration

[key: `string`]: `Socket`[]

___

## Methods

<a id="createconnection"></a>

###  createConnection

▸ **createConnection**(options: *[NativeHttpsAgentOptions](../interfaces/nativehttpsagentoptions.md)*, cb: *[ICallback](../interfaces/icallback.md)*): `void`

*Defined in [https-agent.ts:64](https://github.axa.com/Digital/bauta-nodejs/blob/a176f52/packages/native-proxy-agent/src/https-agent.ts#L64)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| options | [NativeHttpsAgentOptions](../interfaces/nativehttpsagentoptions.md) |
| cb | [ICallback](../interfaces/icallback.md) |

**Returns:** `void`

___
<a id="destroy"></a>

###  destroy

▸ **destroy**(): `void`

*Inherited from Agent.destroy*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:250*

Destroy any sockets that are currently in use by the agent. It is usually not necessary to do this. However, if you are using an agent with KeepAlive enabled, then it is best to explicitly shut down the agent when you know that it will no longer be used. Otherwise, sockets may hang open for quite a long time before the server terminates them.

**Returns:** `void`

___

