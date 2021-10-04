# map decorator

The `map` decorator allows to loop over the given selected array and map each item. You can explore the source code [here](https://github.axa.com/Digital/bauta-nodejs/blob/master/packages/bautajs-core/src/decorators/map.ts).

**The map function can not be async if you need to use async use [parallelMap](./parallelMap) decorator.**

## Example usage

Here we are just looping over the movies and adding extra information

```javascript
  const { map, pipe, step } = require('@bautajs/core')
  
  const getMovies = step(() => [{name: 'star wars'},{ name: 'petter' }]);
  const addGenresNamesToMovie = step((movie) => ({...movie, genre:'action'}));
  const addTmdbIdToMovie = step((movie) => ({...movie, tmdbId:'1234'}));

   const pipeline = pipe(
     getMovies,
     map((movies) => movies, pipe(addGenresNamesToMovie, addTmdbIdToMovie))
   );
 ```