[@bautajs/express](../README.md) > [BautaJSExpress](../classes/bautajsexpress.md)

# Class: BautaJSExpress

Create an Express server using the BautaJS library with almost 0 configuration

*__export__*: 

*__class__*: BautaJSExpress

*__param__*: 

*__param__*: 

*__extends__*: {BautaJS<Request, Response>}

*__example__*: const { BautaJSExpress } = require('@bauta/express'); const apiDefinition from'../../api-definition.json');

const bautJSExpress = new BautaJSExpress(apiDefinition, {}); bautJSExpress.applyMiddlewares(); bautaJS.listen();

## Hierarchy

 `BautaJS`<`Request`, `Response`>

**↳ BautaJSExpress**

## Implements

* `BautaJSBuilder`<`Request`, `Response`>

## Index

### Constructors

* [constructor](bautajsexpress.md#constructor)

### Properties

* [apiDefinitions](bautajsexpress.md#apidefinitions)
* [app](bautajsexpress.md#app)
* [logger](bautajsexpress.md#logger)
* [services](bautajsexpress.md#services)

### Methods

* [applyMiddlewares](bautajsexpress.md#applymiddlewares)
* [listen](bautajsexpress.md#listen)
* [requireAll](bautajsexpress.md#requireall)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new BautaJSExpress**(apiDefinitions: *`Document`[]*, options: *`BautaJSOptions`<`Request`, `Response`>*): [BautaJSExpress](bautajsexpress.md)

*Overrides BautaJS.__constructor*

*Defined in [index.ts:142](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-express/src/index.ts#L142)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| apiDefinitions | `Document`[] |
| options | `BautaJSOptions`<`Request`, `Response`> |

**Returns:** [BautaJSExpress](bautajsexpress.md)

___

## Properties

<a id="apidefinitions"></a>

###  apiDefinitions

**● apiDefinitions**: *`Document`[]*

*Defined in [index.ts:136](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-express/src/index.ts#L136)*

*__type__*: {Document\[\]}

*__memberof__*: BautaJSExpress

___
<a id="app"></a>

###  app

**● app**: *`Application`*

*Defined in [index.ts:142](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-express/src/index.ts#L142)*

*__type__*: {Application}

*__memberof__*: BautaJSExpress

___
<a id="logger"></a>

###  logger

**● logger**: *`Logger`*

*Inherited from BautaJS.logger*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs-express/node_modules/@bautajs/core/dist/bauta.d.ts:4*

___
<a id="services"></a>

###  services

**● services**: *`Services`<`Request`, `Response`>*

*Inherited from BautaJS.services*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs-express/node_modules/@bautajs/core/dist/bauta.d.ts:3*

___

## Methods

<a id="applymiddlewares"></a>

###  applyMiddlewares

▸ **applyMiddlewares**(options?: *[MiddlewareOptions](../interfaces/middlewareoptions.md)*): `this`

*Defined in [index.ts:296](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-express/src/index.ts#L296)*

Add the standard express middlewares and create the created services routes using the given OpenAPI definition.

*__memberof__*: BautaJSExpress

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` options | [MiddlewareOptions](../interfaces/middlewareoptions.md) |  {cors: {enabled: true},bodyParser: {enabled: true},helmet: {enabled: true},morgan: {enabled: true},explorer: {enabled: true}} |

**Returns:** `this`

___
<a id="listen"></a>

###  listen

▸ **listen**(port?: *`number`*, host?: *`string`*, httpsEnabled?: *`boolean`*, httpsOptions?: *`object`*): `Server` \| `Server`

*Defined in [index.ts:395](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-express/src/index.ts#L395)*

Start the express server as http/https listener

*__memberof__*: BautaJSExpress#

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` port | `number` | 3000 |
| `Default value` host | `string` | &quot;localhost&quot; |
| `Default value` httpsEnabled | `boolean` | false |
| `Default value` httpsOptions | `object` |  {} |

**Returns:** `Server` \| `Server`
*   nodejs http/https server

___
<a id="requireall"></a>

### `<Static>` requireAll

▸ **requireAll**<`T`>(folder: *`string` \| `string`[]*, execute?: *`undefined` \| `false` \| `true`*, vars?: *[T]()*): `any`

*Inherited from BautaJS.requireAll*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs-express/node_modules/@bautajs/core/dist/bauta.d.ts:6*

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| folder | `string` \| `string`[] |
| `Optional` execute | `undefined` \| `false` \| `true` |
| `Optional` vars | [T]() |

**Returns:** `any`

___

