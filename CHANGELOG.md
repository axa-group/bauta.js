# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.2.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.1.3...v3.2.0) (2020-05-22)


### Bug Fixes

* **@bautajs/core:** set coerceTypes to false by default ([6f198c1](http://github.axa.com/Digital/bauta-nodejs/commit/6f198c1fbecc7ece7406dda22aa5df2110f561c4)), closes [#172](http://github.axa.com/Digital/bauta-nodejs/issues/172)


### Features

* **@bautajs/datasource-rest:** extend the provider ([#175](http://github.axa.com/Digital/bauta-nodejs/issues/175)) ([8a82778](http://github.axa.com/Digital/bauta-nodejs/commit/8a82778387f61189ef6bc8b9c114c6ec75f4c146)), closes [#167](http://github.axa.com/Digital/bauta-nodejs/issues/167)





## [3.1.3](http://github.axa.com/Digital/bauta-nodejs/compare/v3.1.2...v3.1.3) (2020-04-28)


### Bug Fixes

* **@bautajs/core:** validation error should be 422 ([#170](http://github.axa.com/Digital/bauta-nodejs/issues/170)) ([32fc1d2](http://github.axa.com/Digital/bauta-nodejs/commit/32fc1d2))
* **@bautajs/express,@bautajs/fastify:** fix path ([#169](http://github.axa.com/Digital/bauta-nodejs/issues/169)) ([c794ad3](http://github.axa.com/Digital/bauta-nodejs/commit/c794ad3))





## [3.1.2](http://github.axa.com/Digital/bauta-nodejs/compare/v3.1.1...v3.1.2) (2020-04-22)

##### Documentation Changes

*  improve migration gide (1e675c76)

##### Bug Fixes

* **@bautajs/rest-datasource:**  log query params (#168) (39452f0c)

## [3.1.1](http://github.axa.com/Digital/bauta-nodejs/compare/v3.1.0...v3.1.1) (2020-04-20)


### Bug Fixes

* **@bautajs/core:** hidde ajv logs ([be4b82b](http://github.axa.com/Digital/bauta-nodejs/commit/be4b82b)), closes [#165](http://github.axa.com/Digital/bauta-nodejs/issues/165)





# [3.1.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.0.1...v3.1.0) (2020-04-20)


### Bug Fixes

* pino 6 logs are not concatenated ([#163](http://github.axa.com/Digital/bauta-nodejs/issues/163)) ([d6c7a80](http://github.axa.com/Digital/bauta-nodejs/commit/d6c7a80))


### Features

* set default request header to x-request-id ([#164](http://github.axa.com/Digital/bauta-nodejs/issues/164)) ([8268f9c](http://github.axa.com/Digital/bauta-nodejs/commit/8268f9c))





## [3.0.1](https://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v3.0.1) (2020-04-17)


### Bug Fixes

* **@bautajs-express:** listen is not an async ([03ff036](https://github.axa.com/Digital/bauta-nodejs/commit/03ff036))





## [3.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v2.3.0) (2020-04-16)

### Chores

*  add AXA innersource licenses (9b78f218)
*  update dependencies (e84d561a)

### Documentation Changes

*  add migration guide for bautajs v2 to v3 (#157) (f984aa46)
*  apply axa guidelines for open source (#134) (a257ace3)
*  validation documentation was wrong regarding to the validateResponse function (6fe10bd3)
*  add more info about response validation (ce220921)
*  response validation is disabled by default (ae1fb5b2)

### New Features

* **@bautajs/core,@bautajs/fastify:**  add fastify plugin (c303cd70)

### Bug Fixes

* **@bautajs/express:**
  *  manage 204 status code (52ab2a81)
  *  Listen to aborted event for request cancel(#159) (681bd4ee)
  *  swagger definition expose (b6e42b01)
* **@bautajs/example, @bautajs/cache-decorator:**  add trace logs, add cache example (#160) (40e57acc)
* **@bautajs/core:**
  *  add bautajs to pipeline error handler (#158) (c211c08f)
  *  error can have additional properties  (#139) (a0a89e49)
*  add spyOn to test missing it (0a330262)
* **@bautajs/datasource-rest:**
  *  handle http error (a9ace6bb)
  *  allow to override the agent (2ffbae3f)
* **bautajs-core:**  no validate response streams (#122) (fe39e7e3)

### Other Changes

*  add test for validation of circular schemas (577f557e)
*  building new validator (b0148f16)

### Refactors

*  deprecated validateResponses and validateRequests (a27ce262)
*  conditions on operations.ts (2e165ad9)

### BREAKING CHANGES

* **bautajs-datasource-rest:**  remove template and datasource methods (6b2ba414)
* **@bautajs/cache-decorator:**  use moize to implement cache instead of memoize (#156) (5b37d245)
* **@bautajs/core, @bautajs/express:**
  *  Improve logs (#146) (2b8e73ba)
  *  bautajs bootstrapping now is an async process (#136) (2a974ca6)
* **@bautajs/datasource-rest:**
  *  log the request Id on the datasource log (#137) (18837a55)
  *  Simplify datasource (#135) (051f9355)
* **@bautajs/core,@bautajs/express,@bautajs/datasource-rest:**  logger (#142) (acee5cc6)
*  Change the validator architecture (#125) (319fb856)
*  change validator from open-api module to directly AJV (0be35150)
*  Response validation has been desactivated by default

## [2.5.5](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.4...v2.5.5) (2020-04-16)

##### Bug Fixes

*  on 204 status code don't return a body (#162) (785848b1)

## [2.5.4](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.3...v2.5.4) (2020-04-16)

### Bug Fixes

* **@bautajs/express:**  Do not return response if user cancel the request (15740e6a)

## [2.5.3](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.2...v2.5.3) (2020-04-16)

### Bug Fixes

* **@bautajs/express:**  request cancellation and error log (#155) (7d03d5a3)

## [2.5.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.1...v2.5.2) (2020-04-16) 

### Bug Fixes

* **@bautajs-core:**  added bautajs to the promise error handler (#151) (da269bcb)

## [2.5.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.0...v2.5.1) (2020-04-16)

### Bug Fixes

* **@bautajs-core:**  add bauta reference in pipeline error handler (#150) (a4688ee7)

## [2.5.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.4.0...v2.5.0) (2020-04-16)

### New Features

* **@bautajs/decorator-cache:**  expose the memoized function Related #148 (9e3b3322)


## [2.4.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.3.0...v2.4.0) (2020-04-16)

### Chores

*  remove nsp due to it is deprecated (9aa59af7)
*  add AXA innersource licenses (ae2fba16)

### New Features

* **@bautajs/express:**  add morgan-json to logs (#147) (df4d2c3d)


## [2.3.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.2.2...v2.3.0) (2020-04-16) 

### Chores

*  update gitignore (fb33467a)
*  do not generate package lock on bootstrap (2c5d39af)
*  add no package lock (4766dc16)
*  ignore package lock (845c388b)
*  remove not needed dependencies - Fix typo on datasources (d0566b50)
*  update dev dependencies (cfb59d4f)

### Documentation Changes

* **@bautajs/decorator-cache:**  fix documentation example (9a5cf66d)

### New Features

* **@bautajs/core, @bautajs@express:**  improve morgan logs (#141) (ef3855de)

### Bug Fixes

* **@bautajs-core:**  validate response should be inisde promise resolve (3eb92f0c)
*  operation run do not always returned a promise (#119) (bc5b7553)

## [2.2.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.2.1...v2.2.2) (2019-10-29)


### Bug Fixes

* **@bautajs-core:** validate response should be inisde promise resolve ([3eb92f0](http://github.axa.com/Digital/bauta-nodejs/commit/3eb92f0c3ac3ca54a5c0072893181d414eda09c6))





## [2.2.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.2.0...v2.2.1) (2019-10-29)


### Bug Fixes

* operation run do not always returned a promise ([#119](http://github.axa.com/Digital/bauta-nodejs/issues/119)) ([bc5b755](http://github.axa.com/Digital/bauta-nodejs/commit/bc5b7553b7253075751d6fbdc94e4cf90b45a2d4)), closes [#118](http://github.axa.com/Digital/bauta-nodejs/issues/118) [#117](http://github.axa.com/Digital/bauta-nodejs/issues/117)





# [2.2.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.5...v2.2.0) (2019-09-17)


### Bug Fixes

* **@bautajs-core:** add not found error ([9fdf034](http://github.axa.com/Digital/bauta-nodejs/commit/9fdf034))
* **@bautajs-express:** do not override headers set during the pipeline ([d732ab8](http://github.axa.com/Digital/bauta-nodejs/commit/d732ab8)), closes [#111](http://github.axa.com/Digital/bauta-nodejs/issues/111)
* **@bautajs/datasource-rest:** add more options for template ([98afc32](http://github.axa.com/Digital/bauta-nodejs/commit/98afc32))
* **@bautajs/datasource-rest:** fix datasource options typescript definition ([5db7eb3](http://github.axa.com/Digital/bauta-nodejs/commit/5db7eb3)), closes [#100](http://github.axa.com/Digital/bauta-nodejs/issues/100)
* **@bautajs/express:**  do not expose explorer if explorer is disabled ([3ec324d](http://github.axa.com/Digital/bauta-nodejs/commit/3ec324d)), closes [#104](http://github.axa.com/Digital/bauta-nodejs/issues/104)


### Features

* **@bautajs/core:** do not log default operation step ([0e4cee8](http://github.axa.com/Digital/bauta-nodejs/commit/0e4cee8)), closes [#103](http://github.axa.com/Digital/bauta-nodejs/issues/103)





## [2.1.5](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.4...v2.1.5) (2019-09-04)


### Bug Fixes

* **@bautajs/core:** allow null an the openapi schema on scanprops ([#105](http://github.axa.com/Digital/bauta-nodejs/issues/105)) ([ec984ff](http://github.axa.com/Digital/bauta-nodejs/commit/ec984ff)), closes [#102](http://github.axa.com/Digital/bauta-nodejs/issues/102)
* **@bautajs/core:** do not validate response on set res.headerSent or res.finished ([f1d8f76](http://github.axa.com/Digital/bauta-nodejs/commit/f1d8f76)), closes [#101](http://github.axa.com/Digital/bauta-nodejs/issues/101)





## [2.1.4](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.3...v2.1.4) (2019-08-22)


### Bug Fixes

* **@bautajs/core:** version 2.1.0 introduced a breaking change, allow back compatibility with 2.0.0. ([dfb979b](http://github.axa.com/Digital/bauta-nodejs/commit/dfb979b))





## [2.1.3](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.2...v2.1.3) (2019-08-22)


### Bug Fixes

* **@bautajs/core:** allow charset on content-type on request validation ([d7ab37e](http://github.axa.com/Digital/bauta-nodejs/commit/d7ab37e))





## [2.1.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.1...v2.1.2) (2019-08-21)


### Bug Fixes

* use forked openapi-request-validator until release ([caa4607](http://github.axa.com/Digital/bauta-nodejs/commit/caa4607))





## [2.1.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.0...v2.1.1) (2019-08-21)


### Bug Fixes

* **@bautajs/datasource-rest:** retProvider options type must be madatory and can not be a generic type ([ec28089](http://github.axa.com/Digital/bauta-nodejs/commit/ec28089))





# [2.1.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.1...v2.1.0) (2019-08-21)


### Bug Fixes

* **@bautajs/datasource-rest:** add deepmerge module ([#91](http://github.axa.com/Digital/bauta-nodejs/issues/91)) ([5c4dd22](http://github.axa.com/Digital/bauta-nodejs/commit/5c4dd22))


### Features

* **@bautajs/core:**  pipelines are now runnable. ([#89](http://github.axa.com/Digital/bauta-nodejs/issues/89)) ([78f21d8](http://github.axa.com/Digital/bauta-nodejs/commit/78f21d8)), closes [#86](http://github.axa.com/Digital/bauta-nodejs/issues/86) [#93](http://github.axa.com/Digital/bauta-nodejs/issues/93)
* **@bautajs/datasource-rest:** id is not longer mandatory when use restProvider ([d7d59a6](http://github.axa.com/Digital/bauta-nodejs/commit/d7d59a6)), closes [#94](http://github.axa.com/Digital/bauta-nodejs/issues/94)





## [2.0.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0...v2.0.1) (2019-07-24)


### Bug Fixes

* **@bautajs/datasource-rest:** restProviderTemplate.compile wasn't working. Step fn has 4 parameters not 3 ([45f72e2](http://github.axa.com/Digital/bauta-nodejs/commit/45f72e2))





# [2.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.10...v2.0.0) (2019-07-24)


### Bug Fixes

* allow foreverAgent and extend the agent ([018080e](http://github.axa.com/Digital/bauta-nodejs/commit/018080e))


### Features

* BautaJS refactor concept ([#83](http://github.axa.com/Digital/bauta-nodejs/issues/83)) ([a138074](http://github.axa.com/Digital/bauta-nodejs/commit/a138074)), closes [#82](http://github.axa.com/Digital/bauta-nodejs/issues/82) [#74](http://github.axa.com/Digital/bauta-nodejs/issues/74) [#72](http://github.axa.com/Digital/bauta-nodejs/issues/72) [#78](http://github.axa.com/Digital/bauta-nodejs/issues/78)


### BREAKING CHANGES

* datasources has been removed from the bautajs core. Use it as separated feature (decorator).
* service concept has been removed from the core. Operations are now built from the OpenAPI schema.
* All packages has been moved under @bautajs scope.
* Not core decorators has been moved to another package. @bautajs/datasource-rest, @bautajs/decorator-cache, @bautajs/decorator-template, @bautajs/decorator-filter
* ctx.dataSource do not exist any more, use providers from @bautajs/datasource-rest
* datasource structure has change, services and operations where removed, now use providers instead.
* Operation methods has been modified, some of them has been removed, see ./types for more info
* setup method destroy old version pipeline
* operation versioning has changed, see ./docs/api-versioning.md
* to add certificates and agent options to a datasource you have to create a new agent.
* error handler has been moved to pipeline level as onError

* Features:
* not posible to update agent options, instead create a new agent for it.

- update dependencies to fix audit





# [2.0.0-alpha.10](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2019-07-10)


### Features

* datasource as plugins ([2e86ae8](http://github.axa.com/Digital/bauta-nodejs/commit/2e86ae8)), closes [#75](http://github.axa.com/Digital/bauta-nodejs/issues/75) [#72](http://github.axa.com/Digital/bauta-nodejs/issues/72)


### BREAKING CHANGES

* @bautajs/core it does not have got anymore
* @bautajs/core datasources have been modified to allow pluggable datasource system
* rename decorators packages @bautajs/decorator-cache, @bautajs/decorator-template, @bautajs/decorator-filter
* remove @bautajs/decorators package
* move native-proxy-agent to amf-commons-nodejs
* move multipart-request-builder to amf-commons-nodejs
* compileDataSource include the compiled dataSource as a fn parameter after ctx instead of replace the ctx.dataSource
* ctx.dataSource has been renamed to ctx.dataSourceBuilder





# [2.0.0-alpha.9](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2019-06-28)


### Bug Fixes

* **bautajs:** default open api setter needs to specify empty parameters array ([0984137](http://github.axa.com/Digital/bauta-nodejs/commit/0984137))





# [2.0.0-alpha.8](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2019-06-11)


### Bug Fixes

* **bautajs:** parameters and responses are now take it in account on get the strict definitions ([9b864df](http://github.axa.com/Digital/bauta-nodejs/commit/9b864df)), closes [#70](http://github.axa.com/Digital/bauta-nodejs/issues/70)
* **bautajs-express:** on apply middlewares if some property was specified all middlewares were deleted. ([b62802b](http://github.axa.com/Digital/bauta-nodejs/commit/b62802b))
* **bautajs-express:** set default morgan format to tiny ([e673052](http://github.axa.com/Digital/bauta-nodejs/commit/e673052))
* **bautajs-express:** standarize morgan default log format ([b3742d4](http://github.axa.com/Digital/bauta-nodejs/commit/b3742d4))
* **bautajs, bautajs-express:** operations where exposed twice ([4b0afc8](http://github.axa.com/Digital/bauta-nodejs/commit/4b0afc8)), closes [#69](http://github.axa.com/Digital/bauta-nodejs/issues/69)


### Features

* **bautajs:** log error response from 3 party API with log level error or more ([2a8bf24](http://github.axa.com/Digital/bauta-nodejs/commit/2a8bf24))


### BREAKING CHANGES

* **bautajs, bautajs-express:** dataSourceCtx parameter has becomed dataSourceStatic and can be accessed by `$static.` word inside the dataSources

- Improve express update route algorithm





# [2.0.0-alpha.7](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2019-06-06)


### Bug Fixes

* **bautajs, bautajs/express:** No more crash on create documentation. Get ride of the not used schema definitions. ([1f2bf7f](http://github.axa.com/Digital/bauta-nodejs/commit/1f2bf7f)), closes [#68](http://github.axa.com/Digital/bauta-nodejs/issues/68) [#67](http://github.axa.com/Digital/bauta-nodejs/issues/67)





# [2.0.0-alpha.6](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2019-06-05)


### Bug Fixes

* dataSource from operation must be a private variable ([1bb3f5d](http://github.axa.com/Digital/bauta-nodejs/commit/1bb3f5d))
* **bautajs:** ctx.data was not transmited between operations on run ([1462734](http://github.axa.com/Digital/bauta-nodejs/commit/1462734))
* **bautajs-express:** remove slash on express log of execution time ([f67fbfa](http://github.axa.com/Digital/bauta-nodejs/commit/f67fbfa))


### Features

* **bautajs:** operation.run() req and res are not mandatory anymore ([d6bb9d4](http://github.axa.com/Digital/bauta-nodejs/commit/d6bb9d4))


### BREAKING CHANGES

* operation.dataSource(ctx).request() can not be performed anymore. DataSource is only accesible inside the operation pipeline.

Use instead operation.run()





# [2.0.0-alpha.5](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2019-06-04)


### Bug Fixes

* **bautajs:** default step was not executed even if setup was not specified ([388e252](http://github.axa.com/Digital/bauta-nodejs/commit/388e252))





# [2.0.0-alpha.4](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2019-06-04)


### Bug Fixes

* **bautajs,bautajs-express:** pipeline decorator has an invalid type of parameter ([46e1b97](http://github.axa.com/Digital/bauta-nodejs/commit/46e1b97))





# [2.0.0-alpha.3](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2019-06-03)


### Bug Fixes

* **bautajs-decorators:** request decorator must return as TOut a non promise object ([09fb936](http://github.axa.com/Digital/bauta-nodejs/commit/09fb936))





# [2.0.0-alpha.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2019-06-03)

**Note:** Version bump only for package bauta-nodejs





# [2.0.0-alpha.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2019-06-03)

**Note:** Version bump only for package bauta-nodejs





# [2.0.0-alpha.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.2.2...v2.0.0-alpha.0) (2019-06-03)


### Features

* move to typescript [#49](http://github.axa.com/Digital/bauta-nodejs/issues/49) ([#65](http://github.axa.com/Digital/bauta-nodejs/issues/65)) ([2fa2676](http://github.axa.com/Digital/bauta-nodejs/commit/2fa2676)), closes [#59](http://github.axa.com/Digital/bauta-nodejs/issues/59) [#62](http://github.axa.com/Digital/bauta-nodejs/issues/62)


### BREAKING CHANGES

* dataSource compilation parameters had change, now no ctx has to be passed
* dataSource url can not be changed on dataSource.request() function, request() only allow Got options.
* .push method now only accepts a function with the given signature (value, ctx) => any
* loopbackFilter dataSource option has been moved to a standalone package @bautajs/filters-decorator
* service.myService.version.operation.push has been moved to operation.setup(pipeline => pipeline.push()) to allow better code intellisense
* Step class has been removed
* service.myService.version.push has been removed
* service.myService.version.operation.exec has been replaced for operation.run
* context.req and context.res are now mandatory parameters on run the operation pipeline
* dataSource.request() now returns an object with asBody(), asStream(), asResponse()
* dataSource resolveBodyOnly has been deleted from dataSource now use only on the request, dataSource.request({ resolveBodyOnly:false })
* dataSource stream options has been removed, now use use only on the request, dataSource.request({ stream:true })
* decorators has been moved from 'bautajs/decorators/..' to an standalone package '@bautajs/decorators'
* context.req and context.res are now mandatory parameters on run the operation pipeline





## [1.2.2](http://github.axa.com/Digital/bauta-nodejs/compare/v1.2.1...v1.2.2) (2019-05-08)


### Bug Fixes

* **bautajs-express:** Remove duplicate slash ([#61](http://github.axa.com/Digital/bauta-nodejs/issues/61)) ([b9b00b9](http://github.axa.com/Digital/bauta-nodejs/commit/b9b00b9)), closes [#60](http://github.axa.com/Digital/bauta-nodejs/issues/60)


### Features

* **batuajs,bautajs-express:** add  strict definition filter for explorer ([#64](http://github.axa.com/Digital/bauta-nodejs/issues/64)) ([02d9a4b](http://github.axa.com/Digital/bauta-nodejs/commit/02d9a4b)), closes [#63](http://github.axa.com/Digital/bauta-nodejs/issues/63)





## [1.2.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.2.0...v1.2.1) (2019-04-11)


### Bug Fixes

* **bautajs:** rollback to stjs ([e73edbd](http://github.axa.com/Digital/bauta-nodejs/commit/e73edbd)), closes [#57](http://github.axa.com/Digital/bauta-nodejs/issues/57)





# [1.2.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.5...v1.2.0) (2019-04-11)


### Features

* **bautajs:** add response on validation response error ([#50](http://github.axa.com/Digital/bauta-nodejs/issues/50)) ([163eb9c](http://github.axa.com/Digital/bauta-nodejs/commit/163eb9c)), closes [#48](http://github.axa.com/Digital/bauta-nodejs/issues/48)
* **bautajs:** Inject to resolvers ([#54](http://github.axa.com/Digital/bauta-nodejs/issues/54)) ([c4a730e](http://github.axa.com/Digital/bauta-nodejs/commit/c4a730e)), closes [#46](http://github.axa.com/Digital/bauta-nodejs/issues/46)
* **bautajs:** replace mergeDeep with deepMerge ([#51](http://github.axa.com/Digital/bauta-nodejs/issues/51)) ([5d2db11](http://github.axa.com/Digital/bauta-nodejs/commit/5d2db11)), closes [#47](http://github.axa.com/Digital/bauta-nodejs/issues/47)
* **bautajs:** start using json4json instead of stjs ([#52](http://github.axa.com/Digital/bauta-nodejs/issues/52)) ([e525464](http://github.axa.com/Digital/bauta-nodejs/commit/e525464)), closes [#32](http://github.axa.com/Digital/bauta-nodejs/issues/32)
* **bautajs-cache-decorator:** add a cache decorator ([#56](http://github.axa.com/Digital/bauta-nodejs/issues/56)) ([692a46b](http://github.axa.com/Digital/bauta-nodejs/commit/692a46b)), closes [#54](http://github.axa.com/Digital/bauta-nodejs/issues/54) [#55](http://github.axa.com/Digital/bauta-nodejs/issues/55)





## [1.1.5](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.4...v1.1.5) (2019-04-01)


### Bug Fixes

* **bautajs:** issue with resolveBodyOnly ([#45](http://github.axa.com/Digital/bauta-nodejs/issues/45)) ([d61325b](http://github.axa.com/Digital/bauta-nodejs/commit/d61325b)), closes [#44](http://github.axa.com/Digital/bauta-nodejs/issues/44) [#43](http://github.axa.com/Digital/bauta-nodejs/issues/43)





## [1.1.4](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.3...v1.1.4) (2019-03-26)


### Bug Fixes

* **bautajs:** Add local scope package for request validator ([7281fd7](http://github.axa.com/Digital/bauta-nodejs/commit/7281fd7)), closes [#41](http://github.axa.com/Digital/bauta-nodejs/issues/41)





## [1.1.3](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.2...v1.1.3) (2019-03-25)


### Bug Fixes

* **bautajs:** Return the correct status code on validate the request body. ([8f08847](http://github.axa.com/Digital/bauta-nodejs/commit/8f08847))





## [1.1.2](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.1...v1.1.2) (2019-03-22)


### Bug Fixes

* **bautajs:** verrors.errors is check before calculate the length ([5f06d7c](http://github.axa.com/Digital/bauta-nodejs/commit/5f06d7c)), closes [#40](http://github.axa.com/Digital/bauta-nodejs/issues/40)





## [1.1.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.0...v1.1.1) (2019-03-22)


### Bug Fixes

* **bautajs:** validate response was not working ([#38](http://github.axa.com/Digital/bauta-nodejs/issues/38)) ([0cddb8a](http://github.axa.com/Digital/bauta-nodejs/commit/0cddb8a)), closes [#36](http://github.axa.com/Digital/bauta-nodejs/issues/36)





# [1.1.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.4...v1.1.0) (2019-03-19)


### Features

* **bautajs:** validate response and validate request are now active by default ([#34](http://github.axa.com/Digital/bauta-nodejs/issues/34)) ([212dc3e](http://github.axa.com/Digital/bauta-nodejs/commit/212dc3e)), closes [#33](http://github.axa.com/Digital/bauta-nodejs/issues/33)





## [1.0.4](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.3...v1.0.4) (2019-03-12)


### Bug Fixes

* **bautajs:** fix [#30](http://github.axa.com/Digital/bauta-nodejs/issues/30) ([f57fa40](http://github.axa.com/Digital/bauta-nodejs/commit/f57fa40))





## [1.0.3](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.2...v1.0.3) (2019-03-08)


### Bug Fixes

* **bautajs-express:** fix swagger explorer ([11dc663](http://github.axa.com/Digital/bauta-nodejs/commit/11dc663)), closes [#29](http://github.axa.com/Digital/bauta-nodejs/issues/29)





## [1.0.2](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.1...v1.0.2) (2019-03-07)


### Bug Fixes

* **bautajs:** send previous value on decorators datasources ([5b2d51c](http://github.axa.com/Digital/bauta-nodejs/commit/5b2d51c)), closes [#26](http://github.axa.com/Digital/bauta-nodejs/issues/26)
* **bautajs:** workarround for openAPI request validator bug ([4deec6d](http://github.axa.com/Digital/bauta-nodejs/commit/4deec6d)), closes [#27](http://github.axa.com/Digital/bauta-nodejs/issues/27)





## [1.0.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0...v1.0.1) (2019-03-06)


### Bug Fixes

* **bautajs:** throw an error if operation id is not ([199b17d](http://github.axa.com/Digital/bauta-nodejs/commit/199b17d)), closes [#22](http://github.axa.com/Digital/bauta-nodejs/issues/22)
* **bautajs-express:** routes with different methods were being override it ([3f645e1](http://github.axa.com/Digital/bauta-nodejs/commit/3f645e1)), closes [#24](http://github.axa.com/Digital/bauta-nodejs/issues/24)
* **bautajs-express:** use the express path instead of the swagger route ([6d8b6cc](http://github.axa.com/Digital/bauta-nodejs/commit/6d8b6cc)), closes [#23](http://github.axa.com/Digital/bauta-nodejs/issues/23)





# [1.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0-alpha.0...v1.0.0) (2019-03-06)


### Bug Fixes

* **bautajs:** Add got cache logging support ([707c70b](http://github.axa.com/Digital/bauta-nodejs/commit/707c70b))
* **bautajs:** execute errorHandler just once in all the chain ([464e9e4](http://github.axa.com/Digital/bauta-nodejs/commit/464e9e4)), closes [#17](http://github.axa.com/Digital/bauta-nodejs/issues/17)
* **bautajs:** fix the req end stoper on the chain ([c1c82e9](http://github.axa.com/Digital/bauta-nodejs/commit/c1c82e9))
* **bautajs:** sintactic error on response log ([664bb43](http://github.axa.com/Digital/bauta-nodejs/commit/664bb43))


### Features

* **bautajs:** allow to define options on service level ([fd8268a](http://github.axa.com/Digital/bauta-nodejs/commit/fd8268a)), closes [#10](http://github.axa.com/Digital/bauta-nodejs/issues/10)
* **bautajs-express:** expose swagger explorer ([289ec11](http://github.axa.com/Digital/bauta-nodejs/commit/289ec11)), closes [#14](http://github.axa.com/Digital/bauta-nodejs/issues/14)
* **bautajs,bautajs-express:** allow to set private operations. ([441fe2d](http://github.axa.com/Digital/bauta-nodejs/commit/441fe2d))





# 1.0.0-alpha.0 (2019-02-26)


### Bug Fixes

* **bautajs:** request validation typing ([39002fd](http://github.axa.com/Digital/bauta-nodejs/commit/39002fd))


### Features

* add parallel decorator ([14709ac](http://github.axa.com/Digital/bauta-nodejs/commit/14709ac))
* more of before ([5e9bb66](http://github.axa.com/Digital/bauta-nodejs/commit/5e9bb66))
* **batuajs:** renamee batch to flow ([84f03d5](http://github.axa.com/Digital/bauta-nodejs/commit/84f03d5))
* **bautajs:** add more decorators and documentation ([9f51a08](http://github.axa.com/Digital/bauta-nodejs/commit/9f51a08))
* **bautajs:** fixed test, move to a class aproach, removed next, previous and loaders concept. ([ffcfe6e](http://github.axa.com/Digital/bauta-nodejs/commit/ffcfe6e))
