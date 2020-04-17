# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v3.0.1) (2020-04-17)


### Bug Fixes

* **@bautajs-express:** listen is not an async ([03ff036](https://github.axa.com/Digital/bauta-nodejs/commit/03ff036))





## [3.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v2.3.0) (2020-04-16)

### Bug Fixes

* **@bautajs/express:**
  *  manage 204 status code (52ab2a81)
  *  Listen to aborted event for request cancel(#159) (681bd4ee)
  *  swagger definition expose (b6e42b01)

### BREAKING CHANGES

* **@bautajs/express:**
  *  Improve logs (#146) (2b8e73ba)
  *  bautajs boostraping now is an async process (#136) (2a974ca6)
* **@bautajs/express:**  logger (#142) (acee5cc6)
*  Change the validator architecture (#125) (319fb856)
*  change validator from open-api module to directly AJV (0be35150)


## [2.5.4](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.3...v2.5.4) (2020-04-16)

### Bug Fixes

* **@bautajs/express:**  Do not return response if user cancel the request (15740e6a)

## [2.5.3](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.2...v2.5.3) (2020-04-16)

### Bug Fixes

* **@bautajs/express:**  request cancellation and error log (#155) (7d03d5a3)

## [2.4.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.3.0...v2.4.0) (2020-04-16)

### New Features

* **@bautajs/express:**  add morgan-json to logs (#147) (df4d2c3d)

## [2.3.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.2.2...v2.3.0) (2020-04-16) 

### New Features

* **@bautajs@express:**  improve morgan logs (#141) (ef3855de)

## [2.2.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.2.1...v2.2.2) (2019-10-29)

**Note:** Version bump only for package @bautajs/express





## [2.2.1](https://github.axa.com/Digital/bauta-nodejs/compare/v2.2.0...v2.2.1) (2019-10-29)


### Bug Fixes

* operation run do not always returned a promise ([#119](https://github.axa.com/Digital/bauta-nodejs/issues/119)) ([bc5b755](https://github.axa.com/Digital/bauta-nodejs/commit/bc5b7553b7253075751d6fbdc94e4cf90b45a2d4)), closes [#118](https://github.axa.com/Digital/bauta-nodejs/issues/118) [#117](https://github.axa.com/Digital/bauta-nodejs/issues/117)





# [2.2.0](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.5...v2.2.0) (2019-09-17)


### Bug Fixes

* **@bautajs-express:** do not override headers set during the pipeline ([d732ab8](https://github.axa.com/Digital/bauta-nodejs/commit/d732ab8)), closes [#111](https://github.axa.com/Digital/bauta-nodejs/issues/111)
* **@bautajs/express:**  do not expose explorer if explorer is disabled ([3ec324d](https://github.axa.com/Digital/bauta-nodejs/commit/3ec324d)), closes [#104](https://github.axa.com/Digital/bauta-nodejs/issues/104)





## [2.1.5](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.4...v2.1.5) (2019-09-04)

**Note:** Version bump only for package @bautajs/express





## [2.1.4](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.3...v2.1.4) (2019-08-22)

**Note:** Version bump only for package @bautajs/express





## [2.1.3](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.2...v2.1.3) (2019-08-22)

**Note:** Version bump only for package @bautajs/express





## [2.1.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.1...v2.1.2) (2019-08-21)

**Note:** Version bump only for package @bautajs/express





# [2.1.0](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.1...v2.1.0) (2019-08-21)


### Features

* **@bautajs/core:**  pipelines are now runnable. ([#89](https://github.axa.com/Digital/bauta-nodejs/issues/89)) ([78f21d8](https://github.axa.com/Digital/bauta-nodejs/commit/78f21d8)), closes [#86](https://github.axa.com/Digital/bauta-nodejs/issues/86) [#93](https://github.axa.com/Digital/bauta-nodejs/issues/93)





# [2.0.0](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.10...v2.0.0) (2019-07-24)


### Bug Fixes

* allow foreverAgent and extend the agent ([018080e](https://github.axa.com/Digital/bauta-nodejs/commit/018080e))


### Features

* BautaJS refactor concept ([#83](https://github.axa.com/Digital/bauta-nodejs/issues/83)) ([a138074](https://github.axa.com/Digital/bauta-nodejs/commit/a138074)), closes [#82](https://github.axa.com/Digital/bauta-nodejs/issues/82) [#74](https://github.axa.com/Digital/bauta-nodejs/issues/74) [#72](https://github.axa.com/Digital/bauta-nodejs/issues/72) [#78](https://github.axa.com/Digital/bauta-nodejs/issues/78)


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





# [2.0.0-alpha.10](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2019-07-10)


### Features

* datasource as plugins ([2e86ae8](https://github.axa.com/Digital/bauta-nodejs/commit/2e86ae8)), closes [#75](https://github.axa.com/Digital/bauta-nodejs/issues/75) [#72](https://github.axa.com/Digital/bauta-nodejs/issues/72)


### BREAKING CHANGES

* @bautajs/core it does not have got anymore
* @bautajs/core datasources have been modified to allow pluggable datasource system
* rename decorators packages @bautajs/decorator-cache, @bautajs/decorator-template, @bautajs/decorator-filter
* remove @bautajs/decorators package
* move native-proxy-agent to amf-commons-nodejs
* move multipart-request-builder to amf-commons-nodejs
* compileDataSource include the compiled dataSource as a fn parameter after ctx instead of replace the ctx.dataSource
* ctx.dataSource has been renamed to ctx.dataSourceBuilder





# [2.0.0-alpha.9](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2019-06-28)

**Note:** Version bump only for package @bautajs/express





# [2.0.0-alpha.8](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2019-06-11)


### Bug Fixes

* **bautajs-express:** on apply middlewares if some property was specified all middlewares were deleted. ([b62802b](https://github.axa.com/Digital/bauta-nodejs/commit/b62802b))
* **bautajs-express:** set default morgan format to tiny ([e673052](https://github.axa.com/Digital/bauta-nodejs/commit/e673052))
* **bautajs-express:** standarize morgan default log format ([b3742d4](https://github.axa.com/Digital/bauta-nodejs/commit/b3742d4))
* **bautajs, bautajs-express:** operations where exposed twice ([4b0afc8](https://github.axa.com/Digital/bauta-nodejs/commit/4b0afc8)), closes [#69](https://github.axa.com/Digital/bauta-nodejs/issues/69)


### BREAKING CHANGES

* **bautajs, bautajs-express:** dataSourceCtx parameter has becomed dataSourceStatic and can be accessed by `$static.` word inside the dataSources

- Improve express update route algorithm





# [2.0.0-alpha.7](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2019-06-06)


### Bug Fixes

* **bautajs, bautajs/express:** No more crash on create documentation. Get ride of the not used schema definitions. ([1f2bf7f](https://github.axa.com/Digital/bauta-nodejs/commit/1f2bf7f)), closes [#68](https://github.axa.com/Digital/bauta-nodejs/issues/68) [#67](https://github.axa.com/Digital/bauta-nodejs/issues/67)





# [2.0.0-alpha.6](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2019-06-05)


### Bug Fixes

* **bautajs-express:** remove slash on express log of execution time ([f67fbfa](https://github.axa.com/Digital/bauta-nodejs/commit/f67fbfa))





# [2.0.0-alpha.5](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2019-06-04)

**Note:** Version bump only for package @bautajs/express





# [2.0.0-alpha.4](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2019-06-04)


### Bug Fixes

* **bautajs,bautajs-express:** pipeline decorator has an invalid type of parameter ([46e1b97](https://github.axa.com/Digital/bauta-nodejs/commit/46e1b97))





# [2.0.0-alpha.3](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2019-06-03)

**Note:** Version bump only for package @bautajs/express





# [2.0.0-alpha.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2019-06-03)

**Note:** Version bump only for package @bautajs/express





# [2.0.0-alpha.1](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2019-06-03)

**Note:** Version bump only for package @bautajs/express





# [2.0.0-alpha.0](https://github.axa.com/Digital/bauta-nodejs/compare/v1.2.2...v2.0.0-alpha.0) (2019-06-03)


### Features

* move to typescript [#49](https://github.axa.com/Digital/bauta-nodejs/issues/49) ([#65](https://github.axa.com/Digital/bauta-nodejs/issues/65)) ([2fa2676](https://github.axa.com/Digital/bauta-nodejs/commit/2fa2676)), closes [#59](https://github.axa.com/Digital/bauta-nodejs/issues/59) [#62](https://github.axa.com/Digital/bauta-nodejs/issues/62)


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





## [1.2.2](https://github.axa.com/Digital/bauta-nodejs/compare/v1.2.1...v1.2.2) (2019-05-08)


### Bug Fixes

* **bautajs-express:** Remove duplicate slash ([#61](https://github.axa.com/Digital/bauta-nodejs/issues/61)) ([b9b00b9](https://github.axa.com/Digital/bauta-nodejs/commit/b9b00b9)), closes [#60](https://github.axa.com/Digital/bauta-nodejs/issues/60)


### Features

* **batuajs,bautajs-express:** add  strict definition filter for explorer ([#64](https://github.axa.com/Digital/bauta-nodejs/issues/64)) ([02d9a4b](https://github.axa.com/Digital/bauta-nodejs/commit/02d9a4b)), closes [#63](https://github.axa.com/Digital/bauta-nodejs/issues/63)





## [1.2.1](https://github.axa.com/Digital/bauta-nodejs/compare/v1.2.0...v1.2.1) (2019-04-11)

**Note:** Version bump only for package bautajs-express





# [1.2.0](https://github.axa.com/Digital/bauta-nodejs/compare/v1.1.5...v1.2.0) (2019-04-11)


### Features

* **bautajs:** Inject to resolvers ([#54](https://github.axa.com/Digital/bauta-nodejs/issues/54)) ([c4a730e](https://github.axa.com/Digital/bauta-nodejs/commit/c4a730e)), closes [#46](https://github.axa.com/Digital/bauta-nodejs/issues/46)
* **bautajs:** replace mergeDeep with deepMerge ([#51](https://github.axa.com/Digital/bauta-nodejs/issues/51)) ([5d2db11](https://github.axa.com/Digital/bauta-nodejs/commit/5d2db11)), closes [#47](https://github.axa.com/Digital/bauta-nodejs/issues/47)





## [1.1.5](https://github.axa.com/Digital/bauta-nodejs/compare/v1.1.4...v1.1.5) (2019-04-01)

**Note:** Version bump only for package bautajs-express





## [1.1.4](https://github.axa.com/Digital/bauta-nodejs/compare/v1.1.3...v1.1.4) (2019-03-26)

**Note:** Version bump only for package bautajs-express





## [1.1.3](https://github.axa.com/Digital/bauta-nodejs/compare/v1.1.2...v1.1.3) (2019-03-25)

**Note:** Version bump only for package bautajs-express





## [1.1.2](https://github.axa.com/Digital/bauta-nodejs/compare/v1.1.1...v1.1.2) (2019-03-22)

**Note:** Version bump only for package bautajs-express





## [1.1.1](https://github.axa.com/Digital/bauta-nodejs/compare/v1.1.0...v1.1.1) (2019-03-22)

**Note:** Version bump only for package bautajs-express





# [1.1.0](https://github.axa.com/Digital/bauta-nodejs/compare/v1.0.4...v1.1.0) (2019-03-19)


### Bug Fixes

* **bautajs:** validate response and validate request are now active by default ([#34](https://github.axa.com/Digital/bauta-nodejs/issues/34)) ([212dc3e](https://github.axa.com/Digital/bauta-nodejs/commit/212dc3e)), closes [#33](https://github.axa.com/Digital/bauta-nodejs/issues/33)





## [1.0.4](https://github.axa.com/Digital/bauta-nodejs/compare/v1.0.3...v1.0.4) (2019-03-12)

**Note:** Version bump only for package bautajs-express





## [1.0.3](https://github.axa.com/Digital/bauta-nodejs/compare/v1.0.2...v1.0.3) (2019-03-08)


### Bug Fixes

* **bautajs-express:** fix swagger explorer ([11dc663](https://github.axa.com/Digital/bauta-nodejs/commit/11dc663)), closes [#29](https://github.axa.com/Digital/bauta-nodejs/issues/29)





## [1.0.2](https://github.axa.com/Digital/bauta-nodejs/compare/v1.0.1...v1.0.2) (2019-03-07)

**Note:** Version bump only for package bautajs-express





## [1.0.1](https://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0...v1.0.1) (2019-03-06)


### Bug Fixes

* **bautajs-express:** routes with different methods were being override it ([3f645e1](https://github.axa.com/Digital/bauta-nodejs/commit/3f645e1)), closes [#24](https://github.axa.com/Digital/bauta-nodejs/issues/24)
* **bautajs-express:** use the express path instead of the swagger route ([6d8b6cc](https://github.axa.com/Digital/bauta-nodejs/commit/6d8b6cc)), closes [#23](https://github.axa.com/Digital/bauta-nodejs/issues/23)





# [1.0.0](https://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0-alpha.0...v1.0.0) (2019-03-06)


### Features

* **bautajs:** allow to define options on service level ([fd8268a](https://github.axa.com/Digital/bauta-nodejs/commit/fd8268a)), closes [#10](https://github.axa.com/Digital/bauta-nodejs/issues/10)
* **bautajs-express:** expose swagger explorer ([289ec11](https://github.axa.com/Digital/bauta-nodejs/commit/289ec11)), closes [#14](https://github.axa.com/Digital/bauta-nodejs/issues/14)
* **bautajs,bautajs-express:** allow to set private operations. ([441fe2d](https://github.axa.com/Digital/bauta-nodejs/commit/441fe2d))





# 1.0.0-alpha.0 (2019-02-26)


### Features

* **bautajs:** fixed test, move to a class aproach, removed next, previous and loaders concept. ([ffcfe6e](https://github.axa.com/Digital/bauta-nodejs/commit/ffcfe6e))
* more of before ([5e9bb66](https://github.axa.com/Digital/bauta-nodejs/commit/5e9bb66))
