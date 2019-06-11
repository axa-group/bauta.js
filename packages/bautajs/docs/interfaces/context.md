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

*Defined in [utils/types.ts:188](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L188)*

A dictionary to add custom data to pass between steps

*__type__*: {Dictionary}

*__memberof__*: Context

___
<a id="datasource"></a>

###  dataSource

**● dataSource**: *[OperationDataSourceBuilder](../#operationdatasourcebuilder)*

*Defined in [utils/types.ts:180](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L180)*

The dataSource object where your request data is.

*__type__*: {OperationDataSourceBuilder}

*__memberof__*: Context

___
<a id="id"></a>

### `<Optional>` id

**● id**: *`undefined` \| `string`*

*Inherited from [Session](session.md).[id](session.md#id)*

*Defined in [utils/types.ts:194](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L194)*

___
<a id="logger"></a>

###  logger

**● logger**: *[Logger](logger.md)*

*Inherited from [Session](session.md).[logger](session.md#logger)*

*Defined in [utils/types.ts:196](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L196)*

___
<a id="metadata"></a>

###  metadata

**● metadata**: *[Metadata](metadata.md)*

*Defined in [utils/types.ts:181](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L181)*

___
<a id="req"></a>

###  req

**● req**: *`TReq`*

*Defined in [utils/types.ts:169](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L169)*

___
<a id="res"></a>

###  res

**● res**: *`TRes`*

*Defined in [utils/types.ts:170](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L170)*

___
<a id="url"></a>

###  url

**● url**: *`string` \| `undefined`*

*Inherited from [Session](session.md).[url](session.md#url)*

*Defined in [utils/types.ts:197](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L197)*

___
<a id="userid"></a>

### `<Optional>` userId

**● userId**: *`undefined` \| `string`*

*Inherited from [Session](session.md).[userId](session.md#userid)*

*Defined in [utils/types.ts:195](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L195)*

___
<a id="validaterequest"></a>

###  validateRequest

**● validateRequest**: *[ValidationReqBuilder](../#validationreqbuilder)<`TReq`>*

*Defined in [utils/types.ts:171](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L171)*

___
<a id="validateresponse"></a>

###  validateResponse

**● validateResponse**: *[ValidationResBuilder](../#validationresbuilder)<`TRes`>*

*Defined in [utils/types.ts:172](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L172)*

___

