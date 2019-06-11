[@bautajs/core](../README.md) > [BautaJS](../classes/bautajs.md)

# Class: BautaJS

*__export__*: 

*__class__*: BautaJS

*__implements__*: {BautaJSBuilder<TReq, TRes>}

*__template__*: TReq

*__template__*: TRes

*__param__*: 

*__param__*: 

*__example__*: const BautaJS = require('@bautajs/core'); const apiDefinitions = require('./open-api-definition.json'); const static = { someProp: 'someVal' };

const bautaJS = new BautaJS(apiDefinitions, { // Load all the files with datasource in the file name dataSourcesPath: './services/_\-datasource.?(js\|json)', resolversPath: './services/_\-resolver.js', dataSourceStatic: static, servicesWrapper: (services) => { return { wrappedService: (\_, ctx) => { return services.service.v1.operation.run(ctx); } } } });

// Assuming we have a dataSource for cats, once bautajs is initialized, you can execute the operation with the following code: await bautaJS.services.cats.v1.find.run({});

## Type parameters
#### TReq 
#### TRes 
## Hierarchy

**BautaJS**

## Implements

* [BautaJSBuilder](../interfaces/bautajsbuilder.md)<`TReq`, `TRes`>

## Index

### Constructors

* [constructor](bautajs.md#constructor)

### Properties

* [apiDefinitions](bautajs.md#apidefinitions)
* [logger](bautajs.md#logger)
* [services](bautajs.md#services)

### Methods

* [requireAll](bautajs.md#requireall)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new BautaJS**(apiDefinitions: *[Document](../#document)[]*, options?: *[BautaJSOptions](../interfaces/bautajsoptions.md)<`TReq`, `TRes`>*): [BautaJS](bautajs.md)

*Defined in [bauta.ts:112](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/bauta.ts#L112)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| apiDefinitions | [Document](../#document)[] | - |
| `Default value` options | [BautaJSOptions](../interfaces/bautajsoptions.md)<`TReq`, `TRes`> |  {} |

**Returns:** [BautaJS](bautajs.md)

___

## Properties

<a id="apidefinitions"></a>

###  apiDefinitions

**● apiDefinitions**: *[Document](../#document)[]*

*Implementation of [BautaJSBuilder](../interfaces/bautajsbuilder.md).[apiDefinitions](../interfaces/bautajsbuilder.md#apidefinitions)*

*Defined in [bauta.ts:112](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/bauta.ts#L112)*

___
<a id="logger"></a>

###  logger

**● logger**: *[Logger](../interfaces/logger.md)*

*Implementation of [BautaJSBuilder](../interfaces/bautajsbuilder.md).[logger](../interfaces/bautajsbuilder.md#logger)*

*Defined in [bauta.ts:110](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/bauta.ts#L110)*

A debug instance logger

*__type__*: {Logger}

*__memberof__*: BautaJS

___
<a id="services"></a>

###  services

**● services**: *[Services](../#services)<`TReq`, `TRes`>*

*Implementation of [BautaJSBuilder](../interfaces/bautajsbuilder.md).[services](../interfaces/bautajsbuilder.md#services)*

*Defined in [bauta.ts:103](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/bauta.ts#L103)*

*__type__*: {Services<TReq, TRes>}

*__memberof__*: BautaJS

___

## Methods

<a id="requireall"></a>

### `<Static>` requireAll

▸ **requireAll**<`T`>(folder: *`string` \| `string`[]*, execute?: *`boolean`*, vars?: *[T]()*): `any`

*Defined in [bauta.ts:217](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/bauta.ts#L217)*

Require a bunch of files that matches the given [glob](https://github.com/isaacs/node-glob) path.

*__static__*: 

*__template__*: T

*__memberof__*: BautaJS

*__example__*: const { requireAll } = require('@bautajs/core');

const files = requireAll('./my/path/to/datasources/\*.js', true, {someVar:123});

**Type parameters:**

#### T 
**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| folder | `string` \| `string`[] | - |  \- |
| `Default value` execute | `boolean` | true |
| `Optional` vars | [T]() | - |

**Returns:** `any`

___

