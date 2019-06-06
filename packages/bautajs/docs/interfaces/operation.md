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

*Defined in [utils/types.ts:113](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L113)*

___
<a id="operationid"></a>

###  operationId

**● operationId**: *`string`*

*Defined in [utils/types.ts:114](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L114)*

___
<a id="private"></a>

###  private

**● private**: *`boolean`*

*Defined in [utils/types.ts:111](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L111)*

___
<a id="schema"></a>

###  schema

**● schema**: *[Document](../#document)*

*Defined in [utils/types.ts:112](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L112)*

___
<a id="serviceid"></a>

###  serviceId

**● serviceId**: *`string`*

*Defined in [utils/types.ts:115](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L115)*

___

## Methods

<a id="run"></a>

###  run

▸ **run**(ctx?: *[ContextData](contextdata.md)<`TReq`, `TRes`>*): `Promise`<`any`>

*Defined in [utils/types.ts:122](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L122)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` ctx | [ContextData](contextdata.md)<`TReq`, `TRes`> |

**Returns:** `Promise`<`any`>

___
<a id="seterrorhandler"></a>

###  setErrorHandler

▸ **setErrorHandler**(errorHandler: *`function`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:116](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L116)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| errorHandler | `function` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="setup"></a>

###  setup

▸ **setup**(fn: *`function`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:121](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L121)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="validaterequest"></a>

###  validateRequest

▸ **validateRequest**(toggle: *`boolean`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:119](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L119)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="validateresponse"></a>

###  validateResponse

▸ **validateResponse**(toggle: *`boolean`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:120](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L120)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___

