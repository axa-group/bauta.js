# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
