const morgan = require('morgan');
const Logger = require('./logger');

// Custom token for response time in a more readable format
morgan.token('response-time-ms', (req, res) => {
  const responseTime = parseFloat(morgan['response-time'](req, res));
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for user information (if available)
morgan.token('user', (req) => {
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }
  return 'anonymous';
});

// Custom token for request body size
morgan.token('req-body-size', (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return `${JSON.stringify(req.body).length}bytes`;
  }
  return '0bytes';
});

// Define custom format for development
const developmentFormat =
  ':method :url :status :res[content-length] - :response-time-ms :user';

// Define custom format for production (more detailed)
const productionFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time-ms',
  responseSize: ':res[content-length]',
  userAgent: ':user-agent',
  user: ':user',
  date: ':date[iso]',
  requestBodySize: ':req-body-size',
});

// Create a stream object with write function that will be used by Morgan
const stream = {
  write: (message) => {
    // Use the http log level so it's not shown in production but shown in development
    Logger.http(message.trim());
  },
};

// Skip all the requests in test environment
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Choose format based on environment
const getFormat = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? developmentFormat : productionFormat;
};

// Create Morgan middleware
const morganMiddleware = morgan(getFormat(), {
  stream,
  skip,
});

module.exports = morganMiddleware;
