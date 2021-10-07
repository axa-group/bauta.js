const {
  resolver,
  pipe,
  parallel,
  step,
  parallelAllSettled,
  parallelMap,
  pairwise
} = require('@bautajs/core');
const { getRequest, getResponse } = require('@bautajs/fastify');
const {
  getTopMoviesProvider,
  getMovieGenresProvider,
  getMovieImdbIdProvider,
  getMovieByImdbIdProvider,
  getMovieByTmdbIdProvider,
  getRecommendationsProvider,
  getReviewsProvider,
  rateMovieProvider
} = require('./tmdb-datasource');

const addMoviesWithImdb = pipe(pairwise(getMovieImdbIdProvider()), ([movie, imdbId]) => ({
  ...movie,
  imdb_id: imdbId
}));

const addGenresNamesToMovie = step(([movie, genres]) => {
  const movieGenres = genres.filter(g => movie.genre_ids.includes(g.id));
  return { ...movie, genres: movieGenres };
});

const addTmdbIdToMovie = step(movie => ({ ...movie, tmdb_id: movie.id }));

const calculateRate = step((movie, ctx) => {
  const req = getRequest(ctx);
  const tmdbRate = Math.max((req.body.stars / 5) * 10, 0.5);
  return { rate: tmdbRate, movie };
});

module.exports = resolver(operations => {
  operations.getMovies.setup(
    pipe(
      parallel(
        getTopMoviesProvider(),
        pipe(getMovieGenresProvider(), (genres, ctx) => {
          ctx.data.genres = genres;
        })
      ),
      parallelMap(
        ([movies]) => movies,
        pipe(
          pipe((movie, ctx) => [movie, ctx.data.genres], addGenresNamesToMovie),
          addTmdbIdToMovie,
          addMoviesWithImdb
        )
      )
    )
  );

  operations.getMovieById.setup(
    pipe(
      getMovieByImdbIdProvider(),
      parallelAllSettled(
        getMovieByTmdbIdProvider(),
        getRecommendationsProvider(),
        getReviewsProvider()
      ),
      ([movie, recommendations, reviews]) => {
        if (movie.status === 'rejected') {
          throw movie.reason;
        }

        return {
          ...movie.value,
          recommendations: recommendations.status === 'rejected' ? [] : recommendations.value,
          reviews: reviews.status === 'rejected' ? [] : reviews.value
        };
      },
      addTmdbIdToMovie
    )
  );

  operations.rateMovie.setup(
    pipe(getMovieByImdbIdProvider(), calculateRate, rateMovieProvider(), (_, ctx) => {
      const res = getResponse(ctx);
      res.status(204);
    })
  );
});
