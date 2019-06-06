[@bautajs/core](../README.md) > [RequestFn](../interfaces/requestfn.md)

# Interface: RequestFn

## Hierarchy

**RequestFn**

## Callable
▸ **__call**(localOptions?: *[RequestOptions](requestoptions.md)*): `Promise`<`Buffer` \| `string` \| `object`>

▸ **__call**(localOptions: *[FullResponseRequestOptions](fullresponserequestoptions.md)*): `GotPromise`<`Buffer` \| `string` \| `object`>

▸ **__call**(localOptions: *[StreamRequestOptions](streamrequestoptions.md)*): `GotEmitter` & `nodeStream.Duplex`

*Defined in [utils/types.ts:140](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L140)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` localOptions | [RequestOptions](requestoptions.md) |

**Returns:** `Promise`<`Buffer` \| `string` \| `object`>

*Defined in [utils/types.ts:141](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L141)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| localOptions | [FullResponseRequestOptions](fullresponserequestoptions.md) |

**Returns:** `GotPromise`<`Buffer` \| `string` \| `object`>

*Defined in [utils/types.ts:142](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L142)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| localOptions | [StreamRequestOptions](streamrequestoptions.md) |

**Returns:** `GotEmitter` & `nodeStream.Duplex`

## Index

---

