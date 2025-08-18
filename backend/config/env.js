const { cleanEnv, str, port, url } = require('envalid');

// Only load .env file in development/testing (not production)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Validate and sanitize environment variables
const env = cleanEnv(process.env, {
  NODE_ENV: str({
    default: 'development',
    choices: ['development', 'test', 'production'],
  }),
  PORT: port({ default: 3000 }),
  DB_HOST: str(),
  DB_PORT: port({ default: 5432 }),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_NAME: str(),
  DATABASE_URL: url(),
  JWT_SECRET: str(),
  DB_DIALECT: str({ default: 'postgres' }),
});

module.exports = env;
