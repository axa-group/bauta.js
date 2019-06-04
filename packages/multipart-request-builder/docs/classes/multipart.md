[multipart-request-builder](../README.md) > [Multipart](../classes/multipart.md)

# Class: Multipart

A multipart builder for any request library. It's based on request/request lib.

*__param__*: 

*__export__*: 

*__class__*: Multipart

*__example__*: const { Multipart } = require('multipart-request-buildier'); const options = { preambleCRLF: true, postambleCRLF true }

const multipartInstance = new Multipart(options); const reqOptions = \[ { body: 'I am an attachment' }, { body: fs.createReadStream(path.resolve(\_\_dirname, '../fixtures/test-schema.json')) } \] const multipartRequest = multipartInstance.buildRequest(reqOptions); // { // "body":"\\r\\nsommultipartbody\\r\\n" // "headers": { // "transfer-encoding":"chunked" // } // }

## Hierarchy

**Multipart**

## Index

### Constructors

* [constructor](multipart.md#constructor)

### Methods

* [buildRequest](multipart.md#buildrequest)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Multipart**(options?: *[MultipartOptions](../interfaces/multipartoptions.md)*): [Multipart](multipart.md)

*Defined in [multipart.ts:70](https://github.axa.com/Digital/bauta-nodejs/blob/a176f52/packages/multipart-request-builder/src/multipart.ts#L70)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` options | [MultipartOptions](../interfaces/multipartoptions.md) |  {} |

**Returns:** [Multipart](multipart.md)

___

## Methods

<a id="buildrequest"></a>

###  buildRequest

▸ **buildRequest**(options: *[MultipartRequestBody](../#multipartrequestbody)*): [RequestPart](../interfaces/requestpart.md)

*Defined in [multipart.ts:178](https://github.axa.com/Digital/bauta-nodejs/blob/a176f52/packages/multipart-request-builder/src/multipart.ts#L178)*

Allows build the multipart request

*__memberof__*: Multipart

*__example__*: const multipartRequest = multipartInstance.buildRequest(reqOptions); // { // "body":"\\r\\nsommultipartbody\\r\\n" // "headers": { // "transfer-encoding":"chunked" // } // }

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| options | [MultipartRequestBody](../#multipartrequestbody) |  \- |

**Returns:** [RequestPart](../interfaces/requestpart.md)

___

