[@bautajs/core](../README.md) > [BautaJSOptions](../interfaces/bautajsoptions.md)

# Interface: BautaJSOptions

## Type parameters
#### TReq 
#### TRes 
## Hierarchy

**BautaJSOptions**

## Index

### Properties

* [dataSourceStatic](bautajsoptions.md#datasourcestatic)
* [dataSourcesPath](bautajsoptions.md#datasourcespath)
* [resolversPath](bautajsoptions.md#resolverspath)
* [servicesWrapper](bautajsoptions.md#serviceswrapper)

---

## Properties

<a id="datasourcestatic"></a>

### `<Optional>` dataSourceStatic

**● dataSourceStatic**: *`any`*

*Defined in [utils/types.ts:93](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L93)*

The dataSource static context that will be use to do a first parse to the dataSource on run time.

*__type__*: {any}

*__memberof__*: BautaJSOptions

___
<a id="datasourcespath"></a>

### `<Optional>` dataSourcesPath

**● dataSourcesPath**: *`string` \| `string`[]*

*Defined in [utils/types.ts:85](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L85)*

___
<a id="resolverspath"></a>

### `<Optional>` resolversPath

**● resolversPath**: *`string` \| `string`[]*

*Defined in [utils/types.ts:86](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L86)*

___
<a id="serviceswrapper"></a>

### `<Optional>` servicesWrapper

**● servicesWrapper**: *`undefined` \| `function`*

*Defined in [utils/types.ts:100](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L100)*

Add service utils available on every resolver.

*__type__*: {(services: Services<TReq, TRes>) => any}

*__memberof__*: BautaJSOptions

___

