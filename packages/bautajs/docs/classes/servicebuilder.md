[@bautajs/core](../README.md) > [ServiceBuilder](../classes/servicebuilder.md)

# Class: ServiceBuilder

## Hierarchy

**ServiceBuilder**

## Index

### Methods

* [create](servicebuilder.md#create)

---

## Methods

<a id="create"></a>

### `<Static>` create

▸ **create**<`TReq`,`TRes`>(serviceId: *`string`*, datasourceTemplate: *[ServiceTemplate](../interfaces/servicetemplate.md)*, apiDefinitions?: *[Document](../#document)[]*): [Service](../#service)<`TReq`, `TRes`>

*Defined in [core/service.ts:22](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/core/service.ts#L22)*

**Type parameters:**

#### TReq 
#### TRes 
**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| serviceId | `string` | - |
| datasourceTemplate | [ServiceTemplate](../interfaces/servicetemplate.md) | - |
| `Default value` apiDefinitions | [Document](../#document)[] |  [] |

**Returns:** [Service](../#service)<`TReq`, `TRes`>

___

