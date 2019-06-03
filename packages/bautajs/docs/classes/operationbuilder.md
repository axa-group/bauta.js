[@bautajs/core](../README.md) > [OperationBuilder](../classes/operationbuilder.md)

# Class: OperationBuilder

## Type parameters
#### TReq 
#### TRes 
## Hierarchy

**OperationBuilder**

## Implements

* [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

## Index

### Constructors

* [constructor](operationbuilder.md#constructor)

### Properties

* [apiDefinition](operationbuilder.md#apidefinition)
* [dataSource](operationbuilder.md#datasource)
* [nextVersionOperation](operationbuilder.md#nextversionoperation)
* [operationId](operationbuilder.md#operationid)
* [private](operationbuilder.md#private)
* [schema](operationbuilder.md#schema)
* [serviceId](operationbuilder.md#serviceid)

### Methods

* [run](operationbuilder.md#run)
* [setErrorHandler](operationbuilder.md#seterrorhandler)
* [setSchema](operationbuilder.md#setschema)
* [setup](operationbuilder.md#setup)
* [validateRequest](operationbuilder.md#validaterequest)
* [validateResponse](operationbuilder.md#validateresponse)
* [create](operationbuilder.md#create)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OperationBuilder**(operationId: *`string`*, operationTemplate: *[OperationTemplate](../interfaces/operationtemplate.md)*, apiDefinition: *[Document](../#document)*, serviceId: *`string`*): [OperationBuilder](operationbuilder.md)

*Defined in [core/operation.ts:94](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L94)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| operationId | `string` |
| operationTemplate | [OperationTemplate](../interfaces/operationtemplate.md) |
| apiDefinition | [Document](../#document) |
| serviceId | `string` |

**Returns:** [OperationBuilder](operationbuilder.md)

___

## Properties

<a id="apidefinition"></a>

###  apiDefinition

**● apiDefinition**: *[Document](../#document)*

*Implementation of [Operation](../interfaces/operation.md).[apiDefinition](../interfaces/operation.md#apidefinition)*

*Defined in [core/operation.ts:99](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L99)*

___
<a id="datasource"></a>

###  dataSource

**● dataSource**: *[OperationDataSourceBuilder](../#operationdatasourcebuilder)*

*Implementation of [Operation](../interfaces/operation.md).[dataSource](../interfaces/operation.md#datasource)*

*Defined in [core/operation.ts:81](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L81)*

___
<a id="nextversionoperation"></a>

###  nextVersionOperation

**● nextVersionOperation**: *`null` \| [Operation](../interfaces/operation.md)<`TReq`, `TRes`>* =  null

*Implementation of [Operation](../interfaces/operation.md).[nextVersionOperation](../interfaces/operation.md#nextversionoperation)*

*Defined in [core/operation.ts:83](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L83)*

___
<a id="operationid"></a>

###  operationId

**● operationId**: *`string`*

*Implementation of [Operation](../interfaces/operation.md).[operationId](../interfaces/operation.md#operationid)*

*Defined in [core/operation.ts:97](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L97)*

___
<a id="private"></a>

###  private

**● private**: *`boolean`* = false

*Implementation of [Operation](../interfaces/operation.md).[private](../interfaces/operation.md#private)*

*Defined in [core/operation.ts:77](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L77)*

___
<a id="schema"></a>

###  schema

**● schema**: *[PathsObject](../#pathsobject) \| `null`* =  null

*Implementation of [Operation](../interfaces/operation.md).[schema](../interfaces/operation.md#schema)*

*Defined in [core/operation.ts:79](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L79)*

___
<a id="serviceid"></a>

###  serviceId

**● serviceId**: *`string`*

*Implementation of [Operation](../interfaces/operation.md).[serviceId](../interfaces/operation.md#serviceid)*

*Defined in [core/operation.ts:100](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L100)*

___

## Methods

<a id="run"></a>

###  run

▸ **run**(ctx: *[ContextData](../interfaces/contextdata.md)<`TReq`, `TRes`>*): `Promise`<`any`>

*Implementation of [Operation](../interfaces/operation.md).[run](../interfaces/operation.md#run)*

*Defined in [core/operation.ts:224](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L224)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| ctx | [ContextData](../interfaces/contextdata.md)<`TReq`, `TRes`> |

**Returns:** `Promise`<`any`>

___
<a id="seterrorhandler"></a>

###  setErrorHandler

▸ **setErrorHandler**(errorHandler: *[ErrorHandler](../#errorhandler)<`TReq`, `TRes`>*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Defined in [core/operation.ts:114](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L114)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| errorHandler | [ErrorHandler](../#errorhandler)<`TReq`, `TRes`> |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___
<a id="setschema"></a>

###  setSchema

▸ **setSchema**(schema: *[PathsObject](../#pathsobject)*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Implementation of [Operation](../interfaces/operation.md).[setSchema](../interfaces/operation.md#setschema)*

*Defined in [core/operation.ts:144](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L144)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| schema | [PathsObject](../#pathsobject) |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___
<a id="setup"></a>

###  setup

▸ **setup**(fn: *`function`*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Defined in [core/operation.ts:284](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L284)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___
<a id="validaterequest"></a>

###  validateRequest

▸ **validateRequest**(toggle: *`boolean`*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Implementation of [Operation](../interfaces/operation.md).[validateRequest](../interfaces/operation.md#validaterequest)*

*Defined in [core/operation.ts:130](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L130)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___
<a id="validateresponse"></a>

###  validateResponse

▸ **validateResponse**(toggle: *`boolean`*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Implementation of [Operation](../interfaces/operation.md).[validateResponse](../interfaces/operation.md#validateresponse)*

*Defined in [core/operation.ts:137](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L137)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___
<a id="create"></a>

### `<Static>` create

▸ **create**<`TReq`,`TRes`>(operationId: *`string`*, operationTemplate: *[OperationTemplate](../interfaces/operationtemplate.md)*, apiDefinition: *[Document](../#document)*, serviceId: *`string`*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Defined in [core/operation.ts:63](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/operation.ts#L63)*

**Type parameters:**

#### TReq 
#### TRes 
**Parameters:**

| Name | Type |
| ------ | ------ |
| operationId | `string` |
| operationTemplate | [OperationTemplate](../interfaces/operationtemplate.md) |
| apiDefinition | [Document](../#document) |
| serviceId | `string` |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___

