# Decorators list

Below there is a list of decorators and what they accept based on the following icons:

- :hourglass_flowing_sand: the hourglass icon means that input is a promise
- :bulb: the bulb icon means that input is a synchronous value or function

# List of Bauta decorators


| Allows                          | Name        | path                                                                                        |
|---------------------------------|-------------|---------------------------------------------------------------------------------------------|
| :bulb:                          | catch-error | [bautajs-core/decorators/catch-error](../../packages/bautajs-core/decorators/catch-error)   | 
| :bulb: :hourglass_flowing_sand: | pipeline    | [bautajs-core/decorators/pipeline](../../packages/bautajs-core/decorators/pipeline)         | 
| :bulb:                          | resolver    | [bautajs-core/decorators/resolver](../../packages/bautajs-core/decorators/resolver)         | 
| :bulb: :hourglass_flowing_sand: | step(*)     | [bautajs-core/decorators/step](../../packages/bautajs-core/decorators/step)                 | 


# List of Utility decorators


| Allows                          | Name                 | path                                                                                                            |
|---------------------------------|----------------------|-----------------------------------------------------------------------------------------------------------------|
| :bulb:                          | as-promise           | [bautajs-core/decorators/as-promise](../../packages/bautajs-core/src/decorators/as-promise)                     | 
| :bulb:                          | as-value             | [bautajs-core/decorators/as-value](../../packages/bautajs-core/src/decorators/as-value)                         | 
| :bulb:                          | cache                | [bautajs-core/decorators/cache](../../packages/bautajs-core/src/decorators/cache)                               | 
| :bulb: :hourglass_flowing_sand: | iif(*)               | [bautajs-core/decorators/iif](../../packages/bautajs-core/src/decorators/iif)                                   |
| :bulb: :hourglass_flowing_sand: | map(*)               | [bautajs-core/decorators/map](../../packages/bautajs-core/src/decorators/map)                                   | 
| :bulb:                          | match (matchers)     | [bautajs-core/decorators/match](../../packages/bautajs-core/src/decorators/match)                               | 
| :bulb: :hourglass_flowing_sand: | match (pipelines)    |                                                                                                                 |
| :bulb: :hourglass_flowing_sand: | pairwise             | [bautajs-core/decorators/pairwise](../../packages/bautajs-core/src/decorators/pairwise)                         | 
| :hourglass_flowing_sand:        | parallel-all-settled | [bautajs-core/decorators/parallel-all-settled](../../packages/bautajs-core/src/decorators/parallel-all-settled) |
| :hourglass_flowing_sand:        | parallel-map         | [bautajs-core/decorators/parallel-map](../../packages/bautajs-core/src/decorators/parallel-map)                 |
| :hourglass_flowing_sand:        | parallel             | [bautajs-core/decorators/parallel](../../packages/bautajs-core/src/decorators/parallel)                         |
| :bulb: :hourglass_flowing_sand: | retry-when           | [bautajs-core/decorators/retry-when](../../packages/bautajs-core/src/decorators/retry-when)                     | 
| :bulb: :hourglass_flowing_sand: | tap                  | [bautajs-core/decorators/tap](../../packages/bautajs-core/src/decorators/tap)                                   | 

(*): All these decorators are transparent to the fact that they are using promises or not. That is: if input is a value, they return a value, but if their input is a promise, they return a promise.

