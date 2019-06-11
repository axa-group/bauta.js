[@bautajs/core](../README.md) > [IValidationError](../interfaces/ivalidationerror.md)

# Interface: IValidationError

## Hierarchy

 `Error`

**↳ IValidationError**

## Implemented by

* [ValidationError](../classes/validationerror.md)

## Index

### Properties

* [Error](ivalidationerror.md#error)
* [errors](ivalidationerror.md#errors)
* [message](ivalidationerror.md#message)
* [name](ivalidationerror.md#name)
* [response](ivalidationerror.md#response)
* [stack](ivalidationerror.md#stack)
* [statusCode](ivalidationerror.md#statuscode)
* [toJSON](ivalidationerror.md#tojson)

---

## Properties

<a id="error"></a>

###  Error

**● Error**: *`ErrorConstructor`*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:974*

___
<a id="errors"></a>

###  errors

**● errors**: *[LocationError](locationerror.md)[]*

*Defined in [utils/types.ts:42](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L42)*

___
<a id="message"></a>

###  message

**● message**: *`string`*

*Inherited from Error.message*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:964*

___
<a id="name"></a>

###  name

**● name**: *`string`*

*Inherited from Error.name*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:963*

___
<a id="response"></a>

###  response

**● response**: *`any`*

*Defined in [utils/types.ts:44](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L44)*

___
<a id="stack"></a>

### `<Optional>` stack

**● stack**: *`undefined` \| `string`*

*Inherited from Error.stack*

*Overrides Error.stack*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:965*

___
<a id="statuscode"></a>

###  statusCode

**● statusCode**: *`number`*

*Defined in [utils/types.ts:43](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L43)*

___
<a id="tojson"></a>

###  toJSON

**● toJSON**: *`function`*

*Defined in [utils/types.ts:45](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L45)*

#### Type declaration
▸(): [ValidationErrorJSON](validationerrorjson.md)

**Returns:** [ValidationErrorJSON](validationerrorjson.md)

___

