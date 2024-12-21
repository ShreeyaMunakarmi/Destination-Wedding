import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
};
