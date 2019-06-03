[@bautajs/decorators](../README.md) > [RequestFn](../interfaces/requestfn.md)

# Interface: RequestFn

## Hierarchy

**RequestFn**

## Index

### Methods

* [request](requestfn.md#request)

---

## Methods

<a id="request"></a>

###  request

▸ **request**<`TReq`,`TRes`,`TIn`>(options?: *`RequestOptions`*): `StepFn`<`TReq`, `TRes`, `TIn`, `Promise`<`Buffer` \| `string` \| `object`>>

▸ **request**<`TReq`,`TRes`,`TIn`>(options: *`FullResponseRequestOptions`*): `StepFn`<`TReq`, `TRes`, `TIn`, `GotPromise`<`Buffer` \| `string` \| `object`>>

▸ **request**<`TReq`,`TRes`,`TIn`>(options: *`StreamRequestOptions`*): `StepFn`<`TReq`, `TRes`, `TIn`, `GotEmitter` & `nodeStream.Duplex`>

*Defined in [decorators/request.ts:25](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-decorators/src/decorators/request.ts#L25)*

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` options | `RequestOptions` |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `Promise`<`Buffer` \| `string` \| `object`>>

*Defined in [decorators/request.ts:28](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-decorators/src/decorators/request.ts#L28)*

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
**Parameters:**

| Name | Type |
| ------ | ------ |
| options | `FullResponseRequestOptions` |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `GotPromise`<`Buffer` \| `string` \| `object`>>

*Defined in [decorators/request.ts:31](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-decorators/src/decorators/request.ts#L31)*

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
**Parameters:**

| Name | Type |
| ------ | ------ |
| options | `StreamRequestOptions` |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `GotEmitter` & `nodeStream.Duplex`>

___

