const env = require('./config/env');
const express = require('express');
const cors = require('cors');
const Logger = require('./config/logger');
const morganMiddleware = require('./config/morgan');
const app = express();
// Swagger UI integration (with error handling)
require('./config/swagger')(app);
const PORT = env.PORT;

// Add Morgan HTTP request logging middleware
app.use(morganMiddleware);

// Enable CORS for frontend
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  }),
);

app.use(express.json());

// Load routes
try {
  const userSignupRouter = require('./routes/userSignup');
  const userLoginRouter = require('./routes/userLogin');
  const userManagementRouter = require('./routes/userManagement');
  const taskRouter = require('./routes/tasks');

  app.use('/api/auth', userSignupRouter);
  app.use('/api/auth', userLoginRouter);
  app.use('/api/user', userManagementRouter);
  app.use('/api', taskRouter);
} catch (err) {
  Logger.error('❌ Error loading routes:', err.message);
}

// Global error handling middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });

  next(err);
});

// Handle 404 routes
app.use((req, res) => {
  Logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Start the server
app.listen(PORT, () => {
  Logger.info(`🚀 Server is running on port ${PORT}`);
  // Try to connect to database after server starts
  setTimeout(() => {
    try {
      const sequelize = require('./config/database');
      sequelize
        .authenticate()
        .then(() => {
          Logger.info('Database connection established successfully ✅');
        })
        .catch((err) => {
          Logger.error('Database connection failed ❌:', err.message);
          Logger.warn(
            'Server will continue running without database connectivity',
          );
        });
    } catch (err) {
      Logger.error('Database configuration error:', err.message);
    }
  }, 2000);
});

module.exports = app;
