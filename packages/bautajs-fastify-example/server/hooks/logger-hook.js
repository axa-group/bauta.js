function logRequest(request, reply, done) {
  // eslint-disable-next-line no-console
  request.log.info(`logRequest: ${request.url}`);
  return done();
}

export { logRequest };
