export function notFoundErrorResolver(): any {
  const error = new Error('Not found');
  return Promise.reject(Object.assign(error, { statusCode: 404 }));
}

export default notFoundErrorResolver;
