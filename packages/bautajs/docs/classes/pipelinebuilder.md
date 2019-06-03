[@bautajs/core](../README.md) > [PipelineBuilder](../classes/pipelinebuilder.md)

# Class: PipelineBuilder

## Type parameters
#### TReq 
#### TRes 
#### TIn 
## Hierarchy

**PipelineBuilder**

## Implements

* [Pipeline](../interfaces/pipeline.md)<`TReq`, `TRes`, `TIn`>

## Index

### Constructors

* [constructor](pipelinebuilder.md#constructor)

### Properties

* [accesor](pipelinebuilder.md#accesor)

### Methods

* [push](pipelinebuilder.md#push)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new PipelineBuilder**(accesor: *[HandlerAccesor](../interfaces/handleraccesor.md)<`TReq`, `TRes`>*, serviceId: *`string`*, version: *`string`*, operationId: *`string`*): [PipelineBuilder](pipelinebuilder.md)

*Defined in [core/pipeline.ts:30](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/pipeline.ts#L30)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| accesor | [HandlerAccesor](../interfaces/handleraccesor.md)<`TReq`, `TRes`> |
| serviceId | `string` |
| version | `string` |
| operationId | `string` |

**Returns:** [PipelineBuilder](pipelinebuilder.md)

___

## Properties

<a id="accesor"></a>

###  accesor

**● accesor**: *[HandlerAccesor](../interfaces/handleraccesor.md)<`TReq`, `TRes`>*

*Defined in [core/pipeline.ts:33](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/pipeline.ts#L33)*

___

## Methods

<a id="push"></a>

###  push

▸ **push**<`TOut`>(fn: *[StepFn](../#stepfn)<`TReq`, `TRes`, `TIn`, `TOut`>*): [Pipeline](../interfaces/pipeline.md)<`TReq`, `TRes`, `TOut`>

*Implementation of [Pipeline](../interfaces/pipeline.md).[push](../interfaces/pipeline.md#push)*

*Defined in [core/pipeline.ts:39](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/core/pipeline.ts#L39)*

**Type parameters:**

#### TOut 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | [StepFn](../#stepfn)<`TReq`, `TRes`, `TIn`, `TOut`> |

**Returns:** [Pipeline](../interfaces/pipeline.md)<`TReq`, `TRes`, `TOut`>

___

