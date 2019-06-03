
bautajs-express
---------------

A library to build easy versionable and self organized middlewares for express.

How to install
--------------

Make sure that you have access to [Artifactory](https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/)

```console
  npm install @bautajs/express
```

Usage
-----

```js
const { BautaJSExpress } = require('@bauta/express');
const apiDefinition = require('../../api-definition.json');

const bautJSExpress = new BautaJSExpress(apiDefinition, {});
bautJSExpress.applyMiddlewares();
bautaJS.listen();
```

As [BautaJSExpress](classes/bautajsexpress.md) extends from [BautaJS](../../bautajs/docs/README.md) referer to his documentation to see more options.

## Index

### Classes

* [BautaJSExpress](classes/bautajsexpress.md)

### Interfaces

* [MiddlewareOption](interfaces/middlewareoption.md)
* [MiddlewareOptions](interfaces/middlewareoptions.md)
* [Route](interfaces/route.md)

### Functions

* [resolver](#resolver)
* [step](#step)

---

## Functions

<a id="resolver"></a>

###  resolver

▸ **resolver**<`TReq`,`TRes`>(fn: *`Resolver`<`TReq`, `TRes`>*): `function`

*Defined in [index.ts:428](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-express/src/index.ts#L428)*

A decorator to allow have intellicense on resolver files for non typescript projects

*__export__*: 

*__template__*: TReq

*__template__*: TRes

**Type parameters:**

#### TReq 
#### TRes 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | `Resolver`<`TReq`, `TRes`> |  \- |

**Returns:** `function`

___
<a id="step"></a>

###  step

▸ **step**<`TReq`,`TRes`,`TIn`,`TOut`>(fn: *`StepFn`<`TReq`, `TRes`, `TIn`, `TOut`>*): `function`

*Defined in [index.ts:442](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-express/src/index.ts#L442)*

A decorator to allow intellicense on pushed steps on non typescript files

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

*__template__*: TOut

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
#### TOut 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | `StepFn`<`TReq`, `TRes`, `TIn`, `TOut`> |  \- |

**Returns:** `function`

___

