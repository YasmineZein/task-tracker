const winston = require('winston');
const path = require('path');

// Define custom log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that we want to link the colors
winston.addColors(logColors);

// Define which logs to show based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different formats for different environments
const formats = {
  // Format for console logging in development
  console: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),

  // Format for file logging
  file: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
};

// Define different transports for different log levels
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: formats.console,
  }),

  // Error logs - separate file for errors only
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format: formats.file,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Combined logs - all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    format: formats.file,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
const Logger = winston.createLogger({
  level: level(),
  levels: logLevels,
  transports,

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log'),
      format: formats.file,
    }),
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log'),
      format: formats.file,
    }),
  ],

  // Exit on handled exceptions
  exitOnError: false,
});

module.exports = Logger;
