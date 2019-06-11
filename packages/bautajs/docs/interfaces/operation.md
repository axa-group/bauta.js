[@bautajs/core](../README.md) > [Operation](../interfaces/operation.md)

# Interface: Operation

## Type parameters
#### TReq 
#### TRes 
## Hierarchy

**Operation**

## Implemented by

* [OperationBuilder](../classes/operationbuilder.md)

## Index

### Properties

* [nextVersionOperation](operation.md#nextversionoperation)
* [operationId](operation.md#operationid)
* [private](operation.md#private)
* [schema](operation.md#schema)
* [serviceId](operation.md#serviceid)

### Methods

* [run](operation.md#run)
* [setErrorHandler](operation.md#seterrorhandler)
* [setup](operation.md#setup)
* [validateRequest](operation.md#validaterequest)
* [validateResponse](operation.md#validateresponse)

---

## Properties

<a id="nextversionoperation"></a>

###  nextVersionOperation

**● nextVersionOperation**: *`null` \| [Operation](operation.md)<`TReq`, `TRes`>*

*Defined in [utils/types.ts:125](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L125)*

___
<a id="operationid"></a>

###  operationId

**● operationId**: *`string`*

*Defined in [utils/types.ts:126](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L126)*

___
<a id="private"></a>

###  private

**● private**: *`boolean`*

*Defined in [utils/types.ts:123](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L123)*

___
<a id="schema"></a>

###  schema

**● schema**: *[Document](../#document)*

*Defined in [utils/types.ts:124](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L124)*

___
<a id="serviceid"></a>

###  serviceId

**● serviceId**: *`string`*

*Defined in [utils/types.ts:127](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L127)*

___

## Methods

<a id="run"></a>

###  run

▸ **run**(ctx?: *[ContextData](contextdata.md)<`TReq`, `TRes`>*): `Promise`<`any`>

*Defined in [utils/types.ts:134](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L134)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` ctx | [ContextData](contextdata.md)<`TReq`, `TRes`> |

**Returns:** `Promise`<`any`>

___
<a id="seterrorhandler"></a>

###  setErrorHandler

▸ **setErrorHandler**(errorHandler: *`function`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:128](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L128)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| errorHandler | `function` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="setup"></a>

###  setup

▸ **setup**(fn: *`function`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:133](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L133)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="validaterequest"></a>

###  validateRequest

▸ **validateRequest**(toggle: *`boolean`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:131](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L131)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="validateresponse"></a>

###  validateResponse

▸ **validateResponse**(toggle: *`boolean`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:132](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L132)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___

