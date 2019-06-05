[native-proxy-agent](../README.md) > [HttpAgent](../classes/httpagent.md)

# Class: HttpAgent

## Hierarchy

 `Agent`

**↳ HttpAgent**

## Index

### Constructors

* [constructor](httpagent.md#constructor)

### Properties

* [maxFreeSockets](httpagent.md#maxfreesockets)
* [maxSockets](httpagent.md#maxsockets)
* [requests](httpagent.md#requests)
* [sockets](httpagent.md#sockets)

### Methods

* [destroy](httpagent.md#destroy)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new HttpAgent**(options: *[NativeHttpAgentOptions](../interfaces/nativehttpagentoptions.md)*): [HttpAgent](httpagent.md)

*Overrides Agent.__constructor*

*Defined in [http-agent.ts:18](https://github.axa.com/Digital/bauta-nodejs/blob/c21a44f/packages/native-proxy-agent/src/http-agent.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| options | [NativeHttpAgentOptions](../interfaces/nativehttpagentoptions.md) |

**Returns:** [HttpAgent](httpagent.md)

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

<a id="destroy"></a>

###  destroy

▸ **destroy**(): `void`

*Inherited from Agent.destroy*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/http.d.ts:250*

Destroy any sockets that are currently in use by the agent. It is usually not necessary to do this. However, if you are using an agent with KeepAlive enabled, then it is best to explicitly shut down the agent when you know that it will no longer be used. Otherwise, sockets may hang open for quite a long time before the server terminates them.

**Returns:** `void`

___

