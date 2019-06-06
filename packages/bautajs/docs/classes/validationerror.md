[@bautajs/core](../README.md) > [ValidationError](../classes/validationerror.md)

# Class: ValidationError

## Hierarchy

 `Error`

**↳ ValidationError**

## Implements

* [IValidationError](../interfaces/ivalidationerror.md)

## Index

### Constructors

* [constructor](validationerror.md#constructor)

### Properties

* [errors](validationerror.md#errors)
* [message](validationerror.md#message)
* [name](validationerror.md#name)
* [response](validationerror.md#response)
* [stack](validationerror.md#stack)
* [statusCode](validationerror.md#statuscode)
* [Error](validationerror.md#error)

### Methods

* [toJSON](validationerror.md#tojson)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ValidationError**(message: *`string`*, errors: *[LocationError](../interfaces/locationerror.md)[]*, statusCode?: *`number`*, response?: *`any`*): [ValidationError](validationerror.md)

*Defined in [core/validation-error.ts:23](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/core/validation-error.ts#L23)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| message | `string` | - |
| errors | [LocationError](../interfaces/locationerror.md)[] | - |
| `Default value` statusCode | `number` | 500 |
| `Optional` response | `any` | - |

**Returns:** [ValidationError](validationerror.md)

___

## Properties

<a id="errors"></a>

###  errors

**● errors**: *[LocationError](../interfaces/locationerror.md)[]*

*Implementation of [IValidationError](../interfaces/ivalidationerror.md).[errors](../interfaces/ivalidationerror.md#errors)*

*Defined in [core/validation-error.ts:19](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/core/validation-error.ts#L19)*

___
<a id="message"></a>

###  message

**● message**: *`string`*

*Implementation of [IValidationError](../interfaces/ivalidationerror.md).[message](../interfaces/ivalidationerror.md#message)*

*Inherited from Error.message*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:964*

___
<a id="name"></a>

###  name

**● name**: *`string`*

*Implementation of [IValidationError](../interfaces/ivalidationerror.md).[name](../interfaces/ivalidationerror.md#name)*

*Inherited from Error.name*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:963*

___
<a id="response"></a>

###  response

**● response**: *`any`*

*Implementation of [IValidationError](../interfaces/ivalidationerror.md).[response](../interfaces/ivalidationerror.md#response)*

*Defined in [core/validation-error.ts:23](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/core/validation-error.ts#L23)*

___
<a id="stack"></a>

### `<Optional>` stack

**● stack**: *`undefined` \| `string`*

*Implementation of [IValidationError](../interfaces/ivalidationerror.md).[stack](../interfaces/ivalidationerror.md#stack)*

*Inherited from Error.stack*

*Overrides Error.stack*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:965*

___
<a id="statuscode"></a>

###  statusCode

**● statusCode**: *`number`*

*Implementation of [IValidationError](../interfaces/ivalidationerror.md).[statusCode](../interfaces/ivalidationerror.md#statuscode)*

*Defined in [core/validation-error.ts:21](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/core/validation-error.ts#L21)*

___
<a id="error"></a>

### `<Static>` Error

**● Error**: *`ErrorConstructor`*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:974*

___

## Methods

<a id="tojson"></a>

###  toJSON

▸ **toJSON**(): `object`

*Defined in [core/validation-error.ts:40](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/core/validation-error.ts#L40)*

**Returns:** `object`

___

