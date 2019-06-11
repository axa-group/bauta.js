
BautaJS cache decorator
-----------------------

A cache decorator using [memoizee](https://www.npmjs.com/package/memoizee#configuration) for bautaJS resolvers

How to install
--------------

Make sure that you have access to [Artifactory](https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/)

```console
  npm install @bautajs/cache-decorator
```

Usage
-----

Just add it as a normal decorator

```js
  const { request } = require('@bautajs/decorators');
  const { cache } = require('@bautajs/cache-decorator');

  module.exports = (services)=> {
      const normalizer = (value, ctx) => ctx.id;
      services.pets.v1.get.setup(p => p.push(cache([request(), (result) => ({...result, otherprop:1}), someHeavyOperation], normalizer, { maxAge:3500 })));
  }
```

## Index

### Type aliases

* [Normalizer](#normalizer)

### Functions

* [cache](#cache)

---

## Type aliases

<a id="normalizer"></a>

###  Normalizer

**Ƭ Normalizer**: *`function`*

*Defined in [index.ts:18](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-cache-decorator/src/index.ts#L18)*

#### Type declaration
▸(value: *[`TIn`, `Context`<`TReq`, `TRes`>]*): `any`

**Parameters:**

| Name | Type |
| ------ | ------ |
| value | [`TIn`, `Context`<`TReq`, `TRes`>] |

**Returns:** `any`

___

## Functions

<a id="cache"></a>

###  cache

▸ **cache**<`TReq`,`TRes`,`TIn`>(fn: *`function`*, normalizer: *[Normalizer](#normalizer)<`TReq`, `TRes`, `TIn`>*, options?: *`Options`*): `StepFn`<`TReq`, `TRes`, `TIn`, `null`>

*Defined in [index.ts:36](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-cache-decorator/src/index.ts#L36)*

Cache the given steps with [memoizee](https://www.npmjs.com/package/memoizee)

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

*__example__*: const { cache } = require('@batuajs/cache-decorator'); const { request } = require('@batuajs/decorators');

services.v1.test.op1.setup(p => p.push(cache(request(), (\[\_,ctx\] => ctx.token))))

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| fn | `function` | - |  \- |
| normalizer | [Normalizer](#normalizer)<`TReq`, `TRes`, `TIn`> | - |  \- |
| `Default value` options | `Options` |  {} |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `null`>

___

