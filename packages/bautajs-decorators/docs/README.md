
BautaJS decorators
------------------

Decorator to use on bautaJS resolvers

How to install
--------------

Make sure that you have access to [Artifactory](https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/)

```console
  npm install @bautajs/decorators
```

Usage
-----

Just imported and added as if was your own created function

```js
  const { request } = require('@bautajs/decorators');

  module.exports = (services) => {
      services.pets.v1.get.setup(p => p.push(request()));
  }
```

Available decorators
--------------------

*   [asCallback](#ascallback)
*   [asValue](#asvalue)
*   [compileDataSource](#compiledatasource)
*   [request](#request)
*   [template](#template)

## Index

### Interfaces

* [CompiledContext](interfaces/compiledcontext.md)
* [RequestFn](interfaces/requestfn.md)
* [StaticParallel](interfaces/staticparallel.md)

### Type aliases

* [StepFnCallback](#stepfncallback)
* [StepFnCompiled](#stepfncompiled)

### Variables

* [parallel](#parallel)
* [request](#request)

### Functions

* [asCallback](#ascallback)
* [asValue](#asvalue)
* [compileDataSource](#compiledatasource)
* [template](#template)

---

## Type aliases

<a id="stepfncallback"></a>

###  StepFnCallback

**Ƭ StepFnCallback**: *`function`*

*Defined in [decorators/as-callback.ts:18](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/as-callback.ts#L18)*

#### Type declaration
▸(prev: *`TIn`*, ctx: *`Context`<`TReq`, `TRes`>*, callback: *`function`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| prev | `TIn` |
| ctx | `Context`<`TReq`, `TRes`> |
| callback | `function` |

**Returns:** `void`

___
<a id="stepfncompiled"></a>

###  StepFnCompiled

**Ƭ StepFnCompiled**: *`function`*

*Defined in [decorators/compile-datasource.ts:20](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/compile-datasource.ts#L20)*

#### Type declaration
▸(prev: *`TIn`*, ctx: *[CompiledContext](interfaces/compiledcontext.md)<`TReq`, `TRes`>*): `TOut` \| `Promise`<`TOut`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| prev | `TIn` |
| ctx | [CompiledContext](interfaces/compiledcontext.md)<`TReq`, `TRes`> |

**Returns:** `TOut` \| `Promise`<`TOut`>

___

## Variables

<a id="parallel"></a>

###  parallel

**● parallel**: *[parallel](interfaces/staticparallel.md#parallel)*

*Defined in [decorators/parallel.ts:145](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/parallel.ts#L145)*

___
<a id="request"></a>

###  request

**● request**: *[request](interfaces/requestfn.md#request)*

*Defined in [decorators/request.ts:58](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/request.ts#L58)*

___

## Functions

<a id="ascallback"></a>

###  asCallback

▸ **asCallback**<`TReq`,`TRes`,`TIn`,`TOut`>(fn: *[StepFnCallback](#stepfncallback)<`TReq`, `TRes`, `TIn`, `TOut`>*): `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

*Defined in [decorators/as-callback.ts:40](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/as-callback.ts#L40)*

Allow you to use a callback style async operation

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

*__template__*: TOut

*__example__*: const { asCallback } = require('@batuajs/decorators');

services.v1.test.op1.setup(p => p.push(asCallback((\_, ctx, done) => { done(null, 'hey') })))

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
#### TOut 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | [StepFnCallback](#stepfncallback)<`TReq`, `TRes`, `TIn`, `TOut`> |  \- |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

___
<a id="asvalue"></a>

###  asValue

▸ **asValue**<`TReq`,`TRes`,`TIn`,`TOut`>(someValue: *`TOut`*): `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

*Defined in [decorators/as-value.ts:32](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/as-value.ts#L32)*

Allow to pass directly a value to the resolver

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

*__template__*: TOut

*__example__*: const { asValue } = require('@batuajs/decorators');

services.v1.test.op1.setup(p => p.push(asValue(5)))

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
#### TOut 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| someValue | `TOut` |  \- |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

___
<a id="compiledatasource"></a>

###  compileDataSource

▸ **compileDataSource**<`TReq`,`TRes`,`TIn`,`TOut`>(fn: *[StepFnCompiled](#stepfncompiled)<`TReq`, `TRes`, `TIn`, `TOut`>*): `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

*Defined in [decorators/compile-datasource.ts:44](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/compile-datasource.ts#L44)*

Compile the ctx data source with the given request, resolving all the data source variables In your function you can access to the compiled data source throught ctx.dataSource and do a request using ctx.dataSource.request(); In the datasources all the ctx variables (ctx.req...) and ctx.previousValue will be available.

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

*__template__*: TOut

*__example__*: const { compileDataSource } = require('@batuajs/decorators');

services.v1.test.op1.setup(p => p.push(compileDataSource((\_, ctx) => { return ctx.dataSource.request(); })))

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
#### TOut 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | [StepFnCompiled](#stepfncompiled)<`TReq`, `TRes`, `TIn`, `TOut`> |  \- |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

___
<a id="template"></a>

###  template

▸ **template**<`TReq`,`TRes`,`TIn`,`TOut`>(currentTemplate: *`TOut`*): `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

*Defined in [decorators/template.ts:42](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs-decorators/src/decorators/template.ts#L42)*

Compile the json [stjs](https://www.npmjs.com/package/stjs) template with the given ctx, env, and previous value. The injected variables into the template are:

*   ctx: the current context (req, res...)
*   previousValue: the previous result
*   env: the environment variable

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

*__template__*: TOut

*__example__*: const { template } = require('@batuajs/decorators');

const myTemplate = { "acceptHeader": "{{ctx.req.headers.accept}}", "id": "{{previousValue.id}}", "myEnv": "{{env.myEnv}}" }

services.v1.test.op1.push(template(myTemplate));

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
#### TOut 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| currentTemplate | `TOut` |  \- |

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>

___

