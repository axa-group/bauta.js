function logRequest(request, reply, done) {
  // eslint-disable-next-line no-console
  console.log(`this would be a logRequest: ${request.url}`);
  return done();
}

module.exports = {
  logRequest
};
