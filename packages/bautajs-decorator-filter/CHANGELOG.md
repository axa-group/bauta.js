# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

**Note:** Version bump only for package @bautajs/filters-decorator





# [2.0.0-alpha.8](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2019-06-11)


### Bug Fixes

* **bautajs, bautajs-express:** operations where exposed twice ([4b0afc8](https://github.axa.com/Digital/bauta-nodejs/commit/4b0afc8)), closes [#69](https://github.axa.com/Digital/bauta-nodejs/issues/69)


### BREAKING CHANGES

* **bautajs, bautajs-express:** dataSourceCtx parameter has becomed dataSourceStatic and can be accessed by `$static.` word inside the dataSources

- Improve express update route algorithm





# [2.0.0-alpha.7](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2019-06-06)


### Bug Fixes

* **bautajs, bautajs/express:** No more crash on create documentation. Get ride of the not used schema definitions. ([1f2bf7f](https://github.axa.com/Digital/bauta-nodejs/commit/1f2bf7f)), closes [#68](https://github.axa.com/Digital/bauta-nodejs/issues/68) [#67](https://github.axa.com/Digital/bauta-nodejs/issues/67)





# [2.0.0-alpha.6](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2019-06-05)

**Note:** Version bump only for package @bautajs/filters-decorator





# [2.0.0-alpha.5](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2019-06-04)

**Note:** Version bump only for package @bautajs/filters-decorator





# [2.0.0-alpha.4](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2019-06-04)

**Note:** Version bump only for package @bautajs/filters-decorator





# [2.0.0-alpha.3](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2019-06-03)

**Note:** Version bump only for package @bautajs/filters-decorator





# [2.0.0-alpha.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2019-06-03)

**Note:** Version bump only for package @bautajs/filters-decorator





# [2.0.0-alpha.1](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2019-06-03)

**Note:** Version bump only for package @bautajs/filters-decorator





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
