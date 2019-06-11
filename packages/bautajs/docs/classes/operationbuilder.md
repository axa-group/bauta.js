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

* [nextVersionOperation](operationbuilder.md#nextversionoperation)
* [operationId](operationbuilder.md#operationid)
* [private](operationbuilder.md#private)
* [schema](operationbuilder.md#schema)
* [serviceId](operationbuilder.md#serviceid)

### Methods

* [run](operationbuilder.md#run)
* [setErrorHandler](operationbuilder.md#seterrorhandler)
* [setup](operationbuilder.md#setup)
* [validateRequest](operationbuilder.md#validaterequest)
* [validateResponse](operationbuilder.md#validateresponse)
* [create](operationbuilder.md#create)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OperationBuilder**(operationId: *`string`*, operationTemplate: *[OperationTemplate](../interfaces/operationtemplate.md)*, apiDefinition: *[Document](../#document)*, serviceId: *`string`*): [OperationBuilder](operationbuilder.md)

*Defined in [core/operation.ts:95](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L95)*

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

<a id="nextversionoperation"></a>

###  nextVersionOperation

**● nextVersionOperation**: *`null` \| [Operation](../interfaces/operation.md)<`TReq`, `TRes`>* =  null

*Implementation of [Operation](../interfaces/operation.md).[nextVersionOperation](../interfaces/operation.md#nextversionoperation)*

*Defined in [core/operation.ts:82](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L82)*

___
<a id="operationid"></a>

###  operationId

**● operationId**: *`string`*

*Implementation of [Operation](../interfaces/operation.md).[operationId](../interfaces/operation.md#operationid)*

*Defined in [core/operation.ts:98](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L98)*

___
<a id="private"></a>

###  private

**● private**: *`boolean`* = false

*Implementation of [Operation](../interfaces/operation.md).[private](../interfaces/operation.md#private)*

*Defined in [core/operation.ts:76](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L76)*

___
<a id="schema"></a>

###  schema

**● schema**: *[Document](../#document)*

*Implementation of [Operation](../interfaces/operation.md).[schema](../interfaces/operation.md#schema)*

*Defined in [core/operation.ts:78](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L78)*

___
<a id="serviceid"></a>

###  serviceId

**● serviceId**: *`string`*

*Implementation of [Operation](../interfaces/operation.md).[serviceId](../interfaces/operation.md#serviceid)*

*Defined in [core/operation.ts:101](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L101)*

___

## Methods

<a id="run"></a>

###  run

▸ **run**(ctx?: *[ContextData](../interfaces/contextdata.md)<`TReq`, `TRes`>*): `Promise`<`any`>

*Defined in [core/operation.ts:205](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L205)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` ctx | [ContextData](../interfaces/contextdata.md)<`TReq`, `TRes`> |  {} |

**Returns:** `Promise`<`any`>

___
<a id="seterrorhandler"></a>

###  setErrorHandler

▸ **setErrorHandler**(errorHandler: *[ErrorHandler](../#errorhandler)<`TReq`, `TRes`>*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Defined in [core/operation.ts:109](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L109)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| errorHandler | [ErrorHandler](../#errorhandler)<`TReq`, `TRes`> |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___
<a id="setup"></a>

###  setup

▸ **setup**(fn: *`function`*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Defined in [core/operation.ts:271](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L271)*

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

*Defined in [core/operation.ts:125](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L125)*

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

*Defined in [core/operation.ts:132](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L132)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| toggle | `boolean` |

**Returns:** [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

___
<a id="create"></a>

### `<Static>` create

▸ **create**<`TReq`,`TRes`>(operationId: *`string`*, operationTemplate: *[OperationTemplate](../interfaces/operationtemplate.md)*, apiDefinition: *[Document](../#document)*, serviceId: *`string`*): [Operation](../interfaces/operation.md)<`TReq`, `TRes`>

*Defined in [core/operation.ts:62](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/operation.ts#L62)*

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

