
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

* [pipeline](#pipeline)
* [resolver](#resolver)
* [step](#step)

---

## Functions

<a id="pipeline"></a>

###  pipeline

▸ **pipeline**<`TIn`>(fn: *`function`*): `function`

*Defined in [index.ts:438](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs-express/src/index.ts#L438)*

A decorator to allow intellisense on pipeline on non typescript files

*__export__*: 

*__template__*: TIn

**Type parameters:**

#### TIn 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | `function` |  \- |

**Returns:** `function`

___
<a id="resolver"></a>

###  resolver

▸ **resolver**(fn: *`Resolver`<`Request`, `Response`>*): `function`

*Defined in [index.ts:415](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs-express/src/index.ts#L415)*

A decorator to allow have intellisense on resolver files for non typescript projects

*__export__*: 

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | `Resolver`<`Request`, `Response`> |  \- |

**Returns:** `function`

___
<a id="step"></a>

###  step

▸ **step**<`TIn`,`TOut`>(fn: *`StepFn`<`Request`, `Response`, `TIn`, `TOut`>*): `function`

*Defined in [index.ts:427](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs-express/src/index.ts#L427)*

A decorator to allow intellisense on pushed steps on non typescript files

*__export__*: 

*__template__*: TIn

*__template__*: TOut

**Type parameters:**

#### TIn 
#### TOut 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | `StepFn`<`Request`, `Response`, `TIn`, `TOut`> |  \- |

**Returns:** `function`

___

