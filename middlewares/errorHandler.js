/*export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    console.error(`[${req.method}] ${req.path} - Error: ${message}`);
    res.status(statusCode).json({ error: message });
  };
  */
  import logger from '../utils/logger.js';

  export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    // Log the error
    logger.error(`[${req.method}] ${req.path} - ${message}`, {
      statusCode,
      stack: err.stack,
      body: req.body,
      query: req.query,
      params: req.params,
    });
  
    // Send response to the client
    res.status(statusCode).json({ error: message });
  };
  
  