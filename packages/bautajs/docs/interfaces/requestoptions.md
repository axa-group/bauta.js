[@bautajs/core](../README.md) > [RequestOptions](../interfaces/requestoptions.md)

# Interface: RequestOptions

## Hierarchy

 `GotOptions`<`string` \| `null`>

**↳ RequestOptions**

## Index

### Properties

* [agent](requestoptions.md#agent)
* [baseUrl](requestoptions.md#baseurl)
* [body](requestoptions.md#body)
* [cache](requestoptions.md#cache)
* [cookieJar](requestoptions.md#cookiejar)
* [decompress](requestoptions.md#decompress)
* [encoding](requestoptions.md#encoding)
* [followRedirect](requestoptions.md#followredirect)
* [form](requestoptions.md#form)
* [formData](requestoptions.md#formdata)
* [headers](requestoptions.md#headers)
* [hooks](requestoptions.md#hooks)
* [href](requestoptions.md#href)
* [json](requestoptions.md#json)
* [multipart](requestoptions.md#multipart)
* [postambleCRLF](requestoptions.md#postamblecrlf)
* [preambleCRLF](requestoptions.md#preamblecrlf)
* [proxy](requestoptions.md#proxy)
* [query](requestoptions.md#query)
* [resolveBodyOnly](requestoptions.md#resolvebodyonly)
* [responseType](requestoptions.md#responsetype)
* [retry](requestoptions.md#retry)
* [stream](requestoptions.md#stream)
* [throwHttpErrors](requestoptions.md#throwhttperrors)
* [timeout](requestoptions.md#timeout)
* [useElectronNet](requestoptions.md#useelectronnet)

---

## Properties

<a id="agent"></a>

### `<Optional>` agent

**● agent**: *`Agent` \| `boolean` \| `AgentOptions`*

*Inherited from GotOptions.agent*

*Overrides InternalRequestOptions.agent*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:205*

___
<a id="baseurl"></a>

### `<Optional>` baseUrl

**● baseUrl**: *`undefined` \| `string`*

*Inherited from GotOptions.baseUrl*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:195*

___
<a id="body"></a>

### `<Optional>` body

**● body**: *`string` \| `Buffer` \| `nodeStream.Readable` \| `object` \| `Record`<`string`, `any`>*

*Defined in [utils/types.ts:214](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L214)*

___
<a id="cache"></a>

### `<Optional>` cache

**● cache**: *`Cache`*

*Inherited from GotOptions.cache*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:206*

___
<a id="cookiejar"></a>

### `<Optional>` cookieJar

**● cookieJar**: *`CookieJar`*

*Inherited from GotOptions.cookieJar*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:196*

___
<a id="decompress"></a>

### `<Optional>` decompress

**● decompress**: *`undefined` \| `false` \| `true`*

*Inherited from GotOptions.decompress*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:202*

___
<a id="encoding"></a>

### `<Optional>` encoding

**● encoding**: *`E`*

*Inherited from GotOptions.encoding*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:197*

___
<a id="followredirect"></a>

### `<Optional>` followRedirect

**● followRedirect**: *`undefined` \| `false` \| `true`*

*Inherited from GotOptions.followRedirect*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:201*

___
<a id="form"></a>

### `<Optional>` form

**● form**: *`boolean` \| `object`*

*Defined in [utils/types.ts:215](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L215)*

___
<a id="formdata"></a>

### `<Optional>` formData

**● formData**: *[Dictionary](dictionary.md)<`any`>*

*Defined in [utils/types.ts:220](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L220)*

___
<a id="headers"></a>

### `<Optional>` headers

**● headers**: *`IncomingHttpHeaders`*

*Defined in [utils/types.ts:217](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L217)*

___
<a id="hooks"></a>

### `<Optional>` hooks

**● hooks**: *`Hooks`<`GotOptions`<`string` \| `null`>, `object`>*

*Defined in [utils/types.ts:225](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L225)*

___
<a id="href"></a>

### `<Optional>` href

**● href**: *`undefined` \| `string`*

*Defined in [utils/types.ts:216](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L216)*

___
<a id="json"></a>

### `<Optional>` json

**● json**: *`boolean` \| `object`*

*Defined in [utils/types.ts:221](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L221)*

___
<a id="multipart"></a>

### `<Optional>` multipart

**● multipart**: *`RequestPart`[] \| `MultipartBody`*

*Defined in [utils/types.ts:219](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L219)*

___
<a id="postamblecrlf"></a>

### `<Optional>` postambleCRLF

**● postambleCRLF**: *`undefined` \| `false` \| `true`*

*Defined in [utils/types.ts:224](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L224)*

___
<a id="preamblecrlf"></a>

### `<Optional>` preambleCRLF

**● preambleCRLF**: *`undefined` \| `false` \| `true`*

*Defined in [utils/types.ts:223](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L223)*

___
<a id="proxy"></a>

### `<Optional>` proxy

**● proxy**: *`HttpProxy` \| `HttpsProxy`*

*Defined in [utils/types.ts:222](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L222)*

___
<a id="query"></a>

### `<Optional>` query

**● query**: *`string` \| `object`*

*Inherited from GotOptions.query*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:198*

___
<a id="resolvebodyonly"></a>

### `<Optional>` resolveBodyOnly

**● resolveBodyOnly**: *`undefined` \| `true`*

*Defined in [utils/types.ts:227](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L227)*

___
<a id="responsetype"></a>

### `<Optional>` responseType

**● responseType**: *[ResponseType](../enums/responsetype.md)*

*Defined in [utils/types.ts:218](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L218)*

___
<a id="retry"></a>

### `<Optional>` retry

**● retry**: *`number` \| `RetryOptions`*

*Inherited from GotOptions.retry*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:200*

___
<a id="stream"></a>

### `<Optional>` stream

**● stream**: *`undefined` \| `false`*

*Defined in [utils/types.ts:226](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L226)*

___
<a id="throwhttperrors"></a>

### `<Optional>` throwHttpErrors

**● throwHttpErrors**: *`undefined` \| `false` \| `true`*

*Inherited from GotOptions.throwHttpErrors*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:204*

___
<a id="timeout"></a>

### `<Optional>` timeout

**● timeout**: *`number` \| `TimeoutOptions`*

*Inherited from GotOptions.timeout*

*Overrides InternalRequestOptions.timeout*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:199*

___
<a id="useelectronnet"></a>

### `<Optional>` useElectronNet

**● useElectronNet**: *`undefined` \| `false` \| `true`*

*Inherited from GotOptions.useElectronNet*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/got/index.d.ts:203*

___

