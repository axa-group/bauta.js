[@bautajs/core](../README.md) > [Context](../interfaces/context.md)

# Interface: Context

## Type parameters
#### TReq 
#### TRes 
## Hierarchy

 [Session](session.md)

**↳ Context**

## Index

### Properties

* [data](context.md#data)
* [dataSource](context.md#datasource)
* [id](context.md#id)
* [logger](context.md#logger)
* [metadata](context.md#metadata)
* [req](context.md#req)
* [res](context.md#res)
* [url](context.md#url)
* [userId](context.md#userid)
* [validateRequest](context.md#validaterequest)
* [validateResponse](context.md#validateresponse)

---

## Properties

<a id="data"></a>

###  data

**● data**: *[Dictionary](dictionary.md)<`any`>*

*Defined in [utils/types.ts:176](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L176)*

A dictionary to add custom data to pass between steps

*__type__*: {Dictionary}

*__memberof__*: Context

___
<a id="datasource"></a>

###  dataSource

**● dataSource**: *[OperationDataSourceBuilder](../#operationdatasourcebuilder)*

*Defined in [utils/types.ts:168](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L168)*

The dataSource object where your request data is.

*__type__*: {OperationDataSourceBuilder}

*__memberof__*: Context

___
<a id="id"></a>

### `<Optional>` id

**● id**: *`undefined` \| `string`*

*Inherited from [Session](session.md).[id](session.md#id)*

*Defined in [utils/types.ts:182](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L182)*

___
<a id="logger"></a>

###  logger

**● logger**: *[Logger](logger.md)*

*Inherited from [Session](session.md).[logger](session.md#logger)*

*Defined in [utils/types.ts:184](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L184)*

___
<a id="metadata"></a>

###  metadata

**● metadata**: *[Metadata](metadata.md)*

*Defined in [utils/types.ts:169](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L169)*

___
<a id="req"></a>

###  req

**● req**: *`TReq`*

*Defined in [utils/types.ts:157](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L157)*

___
<a id="res"></a>

###  res

**● res**: *`TRes`*

*Defined in [utils/types.ts:158](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L158)*

___
<a id="url"></a>

###  url

**● url**: *`string` \| `undefined`*

*Inherited from [Session](session.md).[url](session.md#url)*

*Defined in [utils/types.ts:185](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L185)*

___
<a id="userid"></a>

### `<Optional>` userId

**● userId**: *`undefined` \| `string`*

*Inherited from [Session](session.md).[userId](session.md#userid)*

*Defined in [utils/types.ts:183](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L183)*

___
<a id="validaterequest"></a>

###  validateRequest

**● validateRequest**: *[ValidationReqBuilder](../#validationreqbuilder)<`TReq`>*

*Defined in [utils/types.ts:159](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L159)*

___
<a id="validateresponse"></a>

###  validateResponse

**● validateResponse**: *[ValidationResBuilder](../#validationresbuilder)<`TRes`>*

*Defined in [utils/types.ts:160](https://github.axa.com/Digital/bauta-nodejs/blob/167ddcc/packages/bautajs/src/utils/types.ts#L160)*

___

