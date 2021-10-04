# pairwise decorator

The `pairwise` decorator that returns the previous and current value as array. You can explore the source code [here](https://github.axa.com/Digital/bauta-nodejs/blob/master/packages/bautajs-core/src/decorators/pairwise.ts).

## Example usage

Here we are just adding the imdb id to a given movie object.

```javascript
  const { pairwise, step, pipe } =  require('@bautajs/core');
 
    const getMovie = step(() => ({ name: 'star wars' }));
    const getMovieImdbIdAsync = step<{ name: string }, string>(() => Promise.resolve('imdb12354'));

    const pipeline = pipe(getMovie, pairwise(getMovieImdbIdAsync), ([movie, imdbId]) => ({
      ...movie,
      imdb_id: imdbId
    }));
 ```

 ## Error cases

 Errors thrown inside pairwise `pipelines` or `StepFunctions` are propagated as any other `StepFunction`.
 In the example above in case that `getMovieImdbIdAsync` throws an error, the pipeline will stop there and the error will be propagated.