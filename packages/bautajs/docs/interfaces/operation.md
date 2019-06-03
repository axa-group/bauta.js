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

* [apiDefinition](operation.md#apidefinition)
* [dataSource](operation.md#datasource)
* [nextVersionOperation](operation.md#nextversionoperation)
* [operationId](operation.md#operationid)
* [private](operation.md#private)
* [schema](operation.md#schema)
* [serviceId](operation.md#serviceid)

### Methods

* [run](operation.md#run)
* [setErrorHandler](operation.md#seterrorhandler)
* [setSchema](operation.md#setschema)
* [setup](operation.md#setup)
* [validateRequest](operation.md#validaterequest)
* [validateResponse](operation.md#validateresponse)

---

## Properties

<a id="apidefinition"></a>

###  apiDefinition

**● apiDefinition**: *[Document](../#document)*

*Defined in [utils/types.ts:109](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L109)*

___
<a id="datasource"></a>

###  dataSource

**● dataSource**: *[OperationDataSourceBuilder](../#operationdatasourcebuilder)*

*Defined in [utils/types.ts:106](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L106)*

___
<a id="nextversionoperation"></a>

###  nextVersionOperation

**● nextVersionOperation**: *`null` \| [Operation](operation.md)<`TReq`, `TRes`>*

*Defined in [utils/types.ts:107](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L107)*

___
<a id="operationid"></a>

###  operationId

**● operationId**: *`string`*

*Defined in [utils/types.ts:108](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L108)*

___
<a id="private"></a>

###  private

**● private**: *`boolean`*

*Defined in [utils/types.ts:104](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L104)*

___
<a id="schema"></a>

###  schema

**● schema**: *[PathsObject](../#pathsobject) \| `null`*

*Defined in [utils/types.ts:105](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L105)*

___
<a id="serviceid"></a>

###  serviceId

**● serviceId**: *`string`*

*Defined in [utils/types.ts:110](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L110)*

___

## Methods

<a id="run"></a>

###  run

▸ **run**(ctx: *[ContextData](contextdata.md)<`TReq`, `TRes`>*): `Promise`<`any`>

*Defined in [utils/types.ts:118](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L118)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| ctx | [ContextData](contextdata.md)<`TReq`, `TRes`> |

**Returns:** `Promise`<`any`>

___
<a id="seterrorhandler"></a>

###  setErrorHandler

▸ **setErrorHandler**(errorHandler: *`function`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:111](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L111)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| errorHandler | `function` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="setschema"></a>

###  setSchema

▸ **setSchema**(schema: *[PathsObject](../#pathsobject)*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:116](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L116)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| schema | [PathsObject](../#pathsobject) |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="setup"></a>

###  setup

▸ **setup**(fn: *`function`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:117](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L117)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="validaterequest"></a>

###  validateRequest

▸ **validateRequest**(toggle: *`boolean`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:114](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L114)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___
<a id="validateresponse"></a>

###  validateResponse

▸ **validateResponse**(toggle: *`boolean`*): [Operation](operation.md)<`TReq`, `TRes`>

*Defined in [utils/types.ts:115](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L115)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](operation.md)<`TReq`, `TRes`>

___

