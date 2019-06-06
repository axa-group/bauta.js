[@bautajs/core](../README.md) > [Pipeline](../interfaces/pipeline.md)

# Interface: Pipeline

## Type parameters
#### TReq 
#### TRes 
#### TIn 
## Hierarchy

**Pipeline**

## Implemented by

* [PipelineBuilder](../classes/pipelinebuilder.md)

## Index

### Methods

* [push](pipeline.md#push)

---

## Methods

<a id="push"></a>

###  push

▸ **push**<`TOut`>(fn: *[StepFn](../#stepfn)<`TReq`, `TRes`, `TIn`, `TOut`>*): [Pipeline](pipeline.md)<`TReq`, `TRes`, `TOut`>

*Defined in [utils/types.ts:194](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L194)*

**Type parameters:**

#### TOut 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | [StepFn](../#stepfn)<`TReq`, `TRes`, `TIn`, `TOut`> |

**Returns:** [Pipeline](pipeline.md)<`TReq`, `TRes`, `TOut`>

___

