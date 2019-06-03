[@bautajs/core](../README.md) > [Context](../interfaces/context.md)

# Interface: Context

## Type parameters
#### TReq 
#### TRes 
## Hierarchy

 [ContextData](contextdata.md)<`TReq`, `TRes`>

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

*Overrides [ContextData](contextdata.md).[data](contextdata.md#data)*

*Defined in [utils/types.ts:170](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L170)*

A dictionary to add custom data to pass between steps

*__type__*: {Dictionary}

*__memberof__*: Context

___
<a id="datasource"></a>

###  dataSource

**● dataSource**: *[OperationDataSourceBuilder](../#operationdatasourcebuilder)*

*Defined in [utils/types.ts:162](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L162)*

The dataSource object where your request data is.

*__type__*: {OperationDataSourceBuilder}

*__memberof__*: Context

___
<a id="id"></a>

### `<Optional>` id

**● id**: *`undefined` \| `string`*

*Inherited from [Session](session.md).[id](session.md#id)*

*Defined in [utils/types.ts:176](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L176)*

___
<a id="logger"></a>

###  logger

**● logger**: *[Logger](logger.md)*

*Inherited from [Session](session.md).[logger](session.md#logger)*

*Defined in [utils/types.ts:178](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L178)*

___
<a id="metadata"></a>

###  metadata

**● metadata**: *[Metadata](metadata.md)*

*Defined in [utils/types.ts:163](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L163)*

___
<a id="req"></a>

###  req

**● req**: *`TReq`*

*Inherited from [ContextData](contextdata.md).[req](contextdata.md#req)*

*Defined in [utils/types.ts:148](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L148)*

___
<a id="res"></a>

###  res

**● res**: *`TRes`*

*Inherited from [ContextData](contextdata.md).[res](contextdata.md#res)*

*Defined in [utils/types.ts:149](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L149)*

___
<a id="url"></a>

###  url

**● url**: *`string` \| `undefined`*

*Inherited from [Session](session.md).[url](session.md#url)*

*Defined in [utils/types.ts:179](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L179)*

___
<a id="userid"></a>

### `<Optional>` userId

**● userId**: *`undefined` \| `string`*

*Inherited from [Session](session.md).[userId](session.md#userid)*

*Defined in [utils/types.ts:177](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L177)*

___
<a id="validaterequest"></a>

###  validateRequest

**● validateRequest**: *[ValidationReqBuilder](../#validationreqbuilder)<`TReq`>*

*Defined in [utils/types.ts:153](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L153)*

___
<a id="validateresponse"></a>

###  validateResponse

**● validateResponse**: *[ValidationResBuilder](../#validationresbuilder)<`TRes`>*

*Defined in [utils/types.ts:154](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs/src/utils/types.ts#L154)*

___

