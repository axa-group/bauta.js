[@bautajs/core](../README.md) > [OpenAPIV3Document](../interfaces/openapiv3document.md)

# Interface: OpenAPIV3Document

## Hierarchy

 `Document`

**↳ OpenAPIV3Document**

## Index

### Properties

* [components](openapiv3document.md#components)
* [externalDocs](openapiv3document.md#externaldocs)
* [info](openapiv3document.md#info)
* [openapi](openapiv3document.md#openapi)
* [paths](openapiv3document.md#paths)
* [security](openapiv3document.md#security)
* [servers](openapiv3document.md#servers)
* [tags](openapiv3document.md#tags)
* [validateRequest](openapiv3document.md#validaterequest)
* [validateResponse](openapiv3document.md#validateresponse)

---

## Properties

<a id="components"></a>

### `<Optional>` components

**● components**: *`ComponentsObject`*

*Inherited from Document.components*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:21*

___
<a id="externaldocs"></a>

### `<Optional>` externalDocs

**● externalDocs**: *`ExternalDocumentationObject`*

*Inherited from Document.externalDocs*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:24*

___
<a id="info"></a>

###  info

**● info**: *`InfoObject`*

*Inherited from Document.info*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:16*

___
<a id="openapi"></a>

###  openapi

**● openapi**: *`string`*

*Inherited from Document.openapi*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:15*

___
<a id="paths"></a>

###  paths

**● paths**: *`object`*

*Inherited from Document.paths*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:18*

#### Type declaration

[path: `string`]: `PathItemObject`

___
<a id="security"></a>

### `<Optional>` security

**● security**: *`SecurityRequirementObject`[]*

*Inherited from Document.security*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:22*

___
<a id="servers"></a>

### `<Optional>` servers

**● servers**: *`ServerObject`[]*

*Inherited from Document.servers*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:17*

___
<a id="tags"></a>

### `<Optional>` tags

**● tags**: *`TagObject`[]*

*Inherited from Document.tags*

*Defined in /Users/jblanco/axa/bauta-nodejs/packages/bautajs/node_modules/openapi-types/dist/index.d.ts:23*

___
<a id="validaterequest"></a>

### `<Optional>` validateRequest

**● validateRequest**: *`undefined` \| `false` \| `true`*

*Defined in [utils/types.ts:64](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L64)*

___
<a id="validateresponse"></a>

### `<Optional>` validateResponse

**● validateResponse**: *`undefined` \| `false` \| `true`*

*Defined in [utils/types.ts:65](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L65)*

___

