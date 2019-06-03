# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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


### Features

* **batuajs,bautajs-express:** add  strict definition filter for explorer ([#64](http://github.axa.com/Digital/bauta-nodejs/issues/64)) ([02d9a4b](http://github.axa.com/Digital/bauta-nodejs/commit/02d9a4b)), closes [#63](http://github.axa.com/Digital/bauta-nodejs/issues/63)





## [1.1.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.0...v1.1.1) (2019-03-22)

**Note:** Version bump only for package native-proxy-agent





## [1.0.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0...v1.0.1) (2019-03-06)

**Note:** Version bump only for package native-proxy-agent





# [1.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0-alpha.0...v1.0.0) (2019-03-06)

**Note:** Version bump only for package native-proxy-agent





# 1.0.0-alpha.0 (2019-02-26)


### Features

* **bautajs:** fixed test, move to a class aproach, removed next, previous and loaders concept. ([ffcfe6e](http://github.axa.com/Digital/bauta-nodejs/commit/ffcfe6e))
* more of before ([5e9bb66](http://github.axa.com/Digital/bauta-nodejs/commit/5e9bb66))
