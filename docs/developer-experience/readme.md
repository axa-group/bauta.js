# bauta.js and developer experience

## Audience of this document

This document is for anyone starting to learn about the bauta.js library. For example, a developer that has just discovered bauta.js or a technical lead in a team that is wondering whether bauta.js could be helpful to them or cover their needs.

## Reason for this document

This document aims to help you answer the question: "Do I want to use bauta.js?" and provide you with a starting point for answering the question "How do I get started with bauta.js?".

We hope that by reading this document, which should take at most 15 or 20 minutes, you can quickly review what bauta.js is about and let you determine if it could be helpful to you.

This document tries to convey the model used by bauta.js at high level. This is to speed up the process of understanding how bauta.js is used and if it is helpful to you.
### What this document is *not*

- This document does not list bauta.js capabilities or features. 
- This document is not a tutorial on the library itself nor a hands-on. You can have that information in the documentation starting [here](../../README.md).
- Since this is not a tutorial, the explanations in this section differ a bit from the typical pattern "piece of code" --> "what stuff does each line". 

## What is the purpose of bauta.js?

Bauta.js's primary goal is to provide a layer of utilities and abstractions between a low-level library server and your server code. 

To do its job, bauta.js can be used on top of two low-level Node.js frameworks: Express.s or Fastify. Thus, bauta.js is a utility library that provides a set of useful abstractions and glues common patterns that cover most of the use cases related to creating REST APIs and middlewares. 

## Ideal Scenario

The ideal scenario where bauta.js shines is in delivering REST APIs, especially using domain-driven services architecture. This allows you to use and reuse the bauta.js abstractions in different services and gain back the time and effort you might have invested in learning to use it. 

Thus, the ideal scenario could consist of the following:

- A set of one or more services, each with its own business needs. You may deploy each of those services independently.
- Those same services should share common technical requirements regarding security, token management, external calls management, error management, logging, etc.

### What about other scenarios?

Depending on the scenario is up to you to decide whether bauta.js is useful to you or not. We hope this document can help you make that decision.

For example, if you expose a GraphQL server, you can direcGraphQL server like Apollo or Mercurius and may think that you do not need bauta.js [^1].

Another case will be if your REST API is an entire monolith. Is it worth learning about bauta.js if you maintain an already big monolith? As usual, it depends, but the advantage of having your monolith in bauta.js is that it should be easier to organize the codebase by domains.

## The key concepts of bauta.js

### StepFunction: the working unit of bauta.js

`StepFunction` is a function in bauta.js that conforms to the following signature:

- it has three input parameters: `prev`, `context` and `bauta.js` instance.
- it returns a value or a promise that would eventually return a value.

#### Why it is so important?

Because not only the application code uses this as a type. Bauta.js itself uses this signature for its internal execution. Even bauta.js more advanced abstractions are, in turn, or return, a `StepFunction`. And finally, almost all the logic defined in terms of endpoints is a combination of one or more step functions (check pipeline for more details).

One could Think about the code of a bauta.js application as a bunch of step functions run one after another or in parallel and whose results are passed from one to the next defined in your code. 

#### What are the main parts of an StepFunction?

These are three input parameters of a StepFunction:

- prev: is the previous value. This always takes the value (or values) returned by the previous `StepFunction`. This value can be undefined, usually because it is the first StepFunction and there is none previously.

- context: this is the context of the request being processed. You can think of this parameter as the session of the request [^2].

- bautaJSInstance: this object represents the bauta.js server instance itself. The most used field of this object is called staticConfig and has all the variables loaded by bauta.js at startup time.

### Operation 

An operation is a type that abstracts a route definition. Initially, you may think of an operation as a concept that glues together:
- a route or endpoint defined in your OpenAPI specification (swagger).
- if applicable, a schema that the operation has to conform to.
- a business logic that handles the input from the request and generates a response to the caller together with any possible side effect.


### Resolver 

Operations are usually defined together in a single file called resolver in bauta.js. Thus each entity can have its resolver that logically aggregates related operations.



## An example 

Let's try to make an example to help understand these concepts. We want to implement an endpoint that calculates how much money driving between two points would cost. The business logic of our endpoint should do the following:

- from the incoming request call, get the starting and destination points, and generate a request input to a service similar to Google's Distance Matrix API.
- send that request to the service.
- obtain the distance from the response from the previous request.
- using that distance, call another service that returns the price of fuel that you would use.
- return that value to the caller as the response to the incoming request

### bauta.js code structure

In bauta.js, what we like to do is this:

- define a resolver that has the operation defined and that setups as its handler a pipeline.
- define a pipeline with a list of the steps required.

If you are reading this for the first time, it may seem complicated to grasp what it is, but on the code is just the following:


`resolver.js`
```js 
import { resolver } from '@axa/bautajs-core';
import { calculateGasolineCost  } from './calculator-pipeline';

export default resolver(operations => {
  operations['calculate-gasoline-cost'].setup(calculateGasolineCost);
});
```

`calculator-pipeline.js`
```js
import { pipe } from '@axa/bautajs-core';
import { getRequest } from '@axa/bautajs-fastify';

...

const calculateGasolineCost = pipe(
  generateDistanceRequest,
  sendCalculateDistanceMessage(),
  getDistance,
  sendFuelCostMessage(),
  generateResponse
);

```
Brief explanation:

- The file `resolver.js` sets for each operation the pipeline that implements the business logic.

- The file `calculator-pipeline.js` exports the pipeline that implements this business logic. This is done through the decorator function pipe, which has a list of step functions. This allows for a very readable and testable logic, even with more advanced cases with more complex decorators.

*Detail:* 
> The pipe decorator composes the business logic that will be run each time a request is processed from all the StepFunctions passed as arguments. In this list there can be references to any number of StepFunctions that will be run or, like in the example's datasources[^3] ```sendCalculateDistanceMessage``` and ```sendFuelCostMessage```, we might require a function that when run returns a StepFunction reference.


## Decorators

We use plenty of decorators in bauta.js. The main reason for this is to allow the editor to provide dynamic typings. But another is because they are useful to glue the code in a logic way (ressembling a bit functional programming).

Since this is not a tutorial, we will skip how and why they are used in each case. You have extensive documentation about decorators [here](../../README.md#decorators). 

Almost every concept in bauta.js has a decorator that is required to be used. For example:

| Concept | Decorator name |
|------------------------|-----------------------|
| StepFunction | step |
| Resolver | resolver |
| Pipeline | pipe | 

### Why has to be all wrapped in decorators?

It is a fair question, and some of us, when learning bauta.js, have made it.

The short answer is to improve the developer experience.

The long answer is because:

- sometimes the decorators *are* mandatory, and it is easier to use them all the time.
- the decorators, even when optional, mark a function as belonging to a step or a pipeline and help differentiate the code, which is a step from regular functions.
- the decorators may provide helpful IntelliSense help[^4]

For example, imagine you want to make a "guess" service to receive the value head or tail and then check if this guess is valid. Using bauta.js, you might end with something similar to this:

```javascript

const guessPipeline = pipe(
  obtainCoin,
  getGuessResult,
  iif(isGoodGuess, youHaveWon, youHaveLost)
);

```
Using this pattern, every function has a single responsibility. At the pipeline level, the code that glues the logic of the function can be understood easily just by looking at the pipeline. 

Furthermore, you can create a pipeline and pipe it into another one, allowing patterns for composing and reusing pipelines in more than one operation or service.

## Developer experience comparison 

Let's assume that you want to implement an API REST service. Regardless of its functional domain or its technical requirements, there are a few things that the service will need to do.

The following diagram on the left side conveys these responsibilities if you do not use bauta.js.

![bauta.js conceptual comparison](./service-conceptual-hlv.png)

We are not saying that your application code has to implement all those responsibilities from scratch. It is almost certain that you will use libraries for that, but the point is that you will have those libraries as dependencies from your project. You will have to maintain those dependencies and the code that integrates them into your application. 

In comparison, you can see that on the right side, with bauta.js, you have those responsibilities hidden inside bauta.js. So you can use them as quickly with your custom solution, but your service has less boilerplate due to those common technical requirements, and you can focus on your business code. 

### Small note about the diagram and fastify

While the diagram represents 100% a case using the Express.js framework, it is not precisely the same if you use fastify. This is because fastify offers its own high-performance schema validator and body parser. Thus, for the diagram at the right to be correct, the body parser box should be inside the fastify box, and there should be up to two schema validations boxes: one for bauta.js and the other for fastify that validates as well when parsing the request. 

Another way of seeing this is that when using fastify, bauta.js is used as a plugin. The message is the same: your application does not bother with schema validation or other technical details because it is done by the abstractions provided by bauta.js and the chosen server framework.

## Next steps

After this, depending on your preferences, you may do the following:

- You may go to the main documentation page [here](../../README.md) and read further documentation.
- You may go and check our guides [here](../guides/hello-world.md) and [here](../guides/testing.md);
- If you want firsthand contact with the code, you can check our example projects for express [bautajs-express-example](../../packages/bautajs-express-example/) and for fastify [bautajs-fastify-example](../../packages/bautajs-fastify-example/).

### Should I learn bauta.js using express or fastify?

First of all, if you have already made a choice based on your preferences or your needs, then ignore this section. 

However, I doubt whether you should learn bauta.js using fastify or express. In that case, we recommend you start learning bauta.js using the server library that you are more familiar with. You may know express best because it has been around for many years. Or it could be that you know best fastify because you have not used or stopped using express. The point is to try to avoid learning two things simultaneously.

Finally, if you know little about both express and fastify, then at the bauta.js level, it does not matter which of the two you decide to learn. Fastify is more performant, and its abstractions are more modern, so if you have to learn one server framework, it may be the most modern. But fastify has a slightly higher learning curve than express, so you may also start learning bauta.js using express [^5]. 

Suppose you are still trying to figure it out. In that case, you can compare both example projects [bautajs-express-example](.. /packages/bautajs-express-example/) and [bautajs-fastify-example](../../You will see that at bauta.js the code is almost similar but how the server is started depends on each library particularities. 




[^1]: With bauta.js it is possible to expose a Mercurius graphql endpoint, but that is not a common scenario.

[^2]: To be precise the context extends the session of the low level library server and it has a few extra set of data and utilities.

[^3]: The two functions run in this example are datasources, which is a decorator that returns a StepFunction that executes a request to a third party API. You can check further details about datasources [here](../.././docs/datasources.md)

[^4]: This may depend on the editor used, whether you are using typescript or javascript and the code itself

[^5]: This comparison is only in the scope of learning bauta.js. It is totally normal that fastify has a higher learning curve than express because fastify does a lot of more things and covers more responsabilities than express. We are not trying to compare both frameworks or impose a preference on you: both fastify and express are tools and each one of them or both may be perfect depending on your needs.





