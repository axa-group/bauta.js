const { restProvider } = require('@bautajs/datasource-rest');
const { getRequest } = require('@bautajs/fastify');

const tmdbProvider = restProvider.extend({
  prefixUrl: 'https://api.themoviedb.org/3',
  searchParams: {
    api_key: process.env.TMDB_API_KEY
  }
});

module.exports.getTopMoviesProvider = tmdbProvider(async client => {
  const body = await client.get('movie/top_rated');

  return body.results;
});

module.exports.getMovieByTmdbIdProvider = tmdbProvider((client, movie) => {
  return client.get(`movie/${movie.id}`);
});

module.exports.getRecommendationsProvider = tmdbProvider(async (client, movie) => {
  const body = await client.get(`movie/${movie.id}/recommendations`);

  return body.results;
});

module.exports.getReviewsProvider = tmdbProvider(async (client, movie) => {
  const body = await client.get(`movie/${movie.id}/reviews`);

  return body.results;
});

module.exports.getMovieGenresProvider = tmdbProvider(async client => {
  const body = await client.get(`genre/movie/list`);

  return body.genres;
});

module.exports.getMovieByImdbIdProvider = tmdbProvider(async (client, _, ctx) => {
  const req = getRequest(ctx);
  const body = await client.get(`find/${req.params.imdbId}`, {
    searchParams: {
      external_source: 'imdb_id'
    }
  });

  if (body.movie_results.length === 0) {
    const notFound = new Error('Not found');
    notFound.statusCode = 404;

    throw notFound;
  }

  return body.movie_results[0];
});

module.exports.getMovieImdbIdProvider = tmdbProvider(async (client, movie) => {
  const body = await client.get(`movie/${movie.id}/external_ids`);

  return body.imdb_id;
});

module.exports.rateMovieProvider = tmdbProvider(async (client, { movie, rate }, ctx) => {
  const req = getRequest(ctx);

  return client.post(`movie/${movie.id}/rating`, {
    searchParams: { guest_session_id: req.headers.authorization },
    json: { value: rate }
  });
});
