
BautaJS filters decorator
-------------------------

A loopback filters decorator using [loopback-filters](https://github.com/strongloop/loopback-filters) for bautaJS resolvers

How to install
--------------

Make sure that you have access to [Artifactory](https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/)

```console
  npm install @bautajs/filters-decorator
```

Usage
-----

Just add it as a normal decorator

```js
  const { queryFilter } = require('@bautajs/filters-decorator');

  module.exports = (services)=> {
      services.pets.v1.get.setup(p => p.push(() => [{a:'foo'}, {a:'foo2'}]).push(queryFilter))
  }
```

With the given request '/pets?filter\[where\]\[a\]=foo' the result will be:

```json
[{
  "a":"foo"
}]
```

## Index

### Interfaces

* [LoopbackQuery](interfaces/loopbackquery.md)
* [LoopbackRequest](interfaces/loopbackrequest.md)

### Functions

* [queryFilters](#queryfilters)

---

## Functions

<a id="queryfilters"></a>

###  queryFilters

▸ **queryFilters**<`TReq`,`TRes`,`TIn`>(): `StepFn`<`TReq`, `TRes`, `TIn`[], `TIn`[]>

*Defined in [index.ts:43](https://github.axa.com/Digital/bauta-nodejs/blob/9a199d7/packages/bautajs-filters-decorator/src/index.ts#L43)*

Allow to filter the current request using loopback query filters. This decorator will filter the previous pushed value using the req.query.filter parameter of the request

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

*__example__*: const { queryFilter } = require('@bautajs/filters-decorator');

services.v1.test.op1.setup(p => p.push(queryFilter()))

**Type parameters:**

#### TReq :  [LoopbackRequest](interfaces/loopbackrequest.md)
#### TRes 
#### TIn 

**Returns:** `StepFn`<`TReq`, `TRes`, `TIn`[], `TIn`[]>
{StepFn< TReq, TRes, TIn\[\], TIn\[\]

> }

___

