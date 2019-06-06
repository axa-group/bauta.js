[@bautajs/core](../README.md) > [Accesor](../classes/accesor.md)

# Class: Accesor

## Type parameters
#### TReq 
#### TRes 
## Hierarchy

**Accesor**

## Implements

* [HandlerAccesor](../interfaces/handleraccesor.md)<`TReq`, `TRes`>

## Index

### Accessors

* [handler](accesor.md#handler)

---

## Accessors

<a id="handler"></a>

###  handler

**get handler**(): [StepFn](../#stepfn)<`TReq`, `TRes`, `any`, `any`>

**set handler**(fn: *[StepFn](../#stepfn)<`TReq`, `TRes`, `any`, `any`>*): `void`

*Defined in [core/pipeline.ts:21](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/core/pipeline.ts#L21)*

**Returns:** [StepFn](../#stepfn)<`TReq`, `TRes`, `any`, `any`>

*Defined in [core/pipeline.ts:25](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/core/pipeline.ts#L25)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | [StepFn](../#stepfn)<`TReq`, `TRes`, `any`, `any`> |

**Returns:** `void`

___

