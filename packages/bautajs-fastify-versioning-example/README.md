# bautajs-fastify-versioning-example

- This API example intends to show how you can manage versioning with bautajs-fastify.
- This project example purpose is to showcase main features using simple examples. 
- This project example **does not** intend to show good practices using Node.js or security practices at all. Please be sure you follow security good practices on your Node.js API (i.e. adding [helmet](@fastify/helmet)).

## How to start

- It is recommented that you are using node v18.
- `npm install` from the root project of the monorepo
- enter into `packages/bautajs-fastify-versioning-example` folder 

## Brief explanation of the different examples

We have a set of three services:

- `v1`
  - `cats` --> endpoint marked as `deprecated`. This service returns name, communication and breed
  - `dogs` --> This service returns name, communication and breed
- `v2`
  - `cats` --> latest version of the endpoint. This service returns petName, communication and favouriteAction


## An example of each initialization method 

You can run npm start for each one of the scripts:

- ``npm run start``: Uses default port 8080. Basic example without any versioning. Only v1 endpoints are exposed.
- ``start:external``: Configures the versioning inheritance outside the plugin.
- ``start:plugin``: Configures the versioning inheritance with the plugin option 'inheritOperationsFrom' and instantiates the two instances of bautaJs (the original and the new version).
- ``start:parent``: Configures the versioning inheritance instantiating only the parent bautaJs instance and uses the plugin option 'inheritOperationsFrom' to add the new version endpoints.


This is only a showcase of how the versioning works. For details you should check [versioning](https://github.com/axa-group/bauta.js/blob/main/docs/api-versioning.md).


## Third party dependencies licenses

### Production
 - [@axa/bautajs-core@3.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-datasource-rest@3.0.0](https://github.com/axa-group/bauta.js) - MIT* 
 - [@axa/bautajs-fastify@3.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [fastify@4.8.1](https://github.com/fastify/fastify) - MIT
