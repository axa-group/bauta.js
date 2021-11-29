# match decorator

It allows you to set a pair (or sets of pairs) of step functions that will be executed conditionally. We call the first function the predicate (it returns a boolean) and the second one the statement step function. The latter will be executed only if the former evaluates to `true`. In this sense this decorator is similar to [iif](iif.md), however `match` decorator allows you to set a default statement function, that will be executed if predicate evaluates to `false'. In addition, you can "pipe" multiple pairs (predicate and statement) and have just one default statement step function for all of them. You can explore the source code [here](../../bautajs-core/src/decorators/match.ts).

## Example

### One predicate-statement function pair

In this example the first argument of the m.on() method (our predicate function) will evaluate to `false`, hence the `otherwise()` function will be invoked.

```javascript
const { match, pipe } = require('@axa/bautajs-core');

bautajsInstance.operations.v1.randomOperation.setup(
  pipe(
      () => console.log('nighter a predicate nor a statement step function'),
      match(m =>
        m
        .on((prev)=> typeof prev === 'number', () => console.log('Only meat lovers'))
        .otherwise(() => console.log('You can always eat veggies!'))
      )
    ));

// => return value of the pipeline will be an array (we piped two step functions):
// ['nighter a predicate nor a statement step function', 'You can always eat veggies!']
```

### More than one predicate-statement function pair

Here the second predicate function evaluates to `true`,
so the string `'I love and care about our oceans'` will be logged to the console. Note that in this case `otherwise()` statement will not be invoked.

```javascript
const { match, pipelineBuilder } = require('@axa/bautajs-core');

bautajsInstance.operations.v1.randomOperation.setup(
  pipe(
      () => return true,
      match(
        m
          .on(prev => prev === false, () => console.log('I am an ignorant and leave garbage on the beach'))
          .on(prev => prev === true, () => console.log('I love and care about our oceans'))
          .otherwise(() => null)
      )
    )
);

// => 'I love and care about our oceans'
```
