# Task Tracker - Environment Variables & Containerization

This document explains the environment variable management and containerization setup for the Task Tracker application.

## 🎯 What Was Implemented

### Backend Environment Variables
- **Development**: Uses `.env` file loaded conditionally (only when `NODE_ENV !== 'production'`)
- **Production**: Environment variables provided via Docker Compose
- **Validation**: Uses `envalid` library to validate and sanitize environment variables
- **Clean Architecture**: Centralized environment configuration in `config/env.js`

### Frontend Environment Variables
- **Development**: Uses Vite's `.env` file support
- **Production**: Runtime injection via `envsubst` in Docker container
- **Dual Support**: Works with both build-time and runtime environment variables
- **Configuration Helper**: Centralized environment access via `src/config/env.js`

### Containerization
- **Backend**: Node.js Docker container with production-ready configuration
- **Frontend**: Multi-stage Docker build (React build + Nginx serving)
- **Database**: PostgreSQL container with persistent volumes
- **Orchestration**: Docker Compose for complete application stack

## 📁 Files Created/Modified

### Backend
- `config/env.js` - Environment variable validation and loading
- `Dockerfile` - Backend containerization
- `docker-compose.yml` - Complete application orchestration
- `.dockerignore` - Docker build optimization
- `.gitignore` - Updated with environment files
- `server.js` - Updated to use new environment configuration

### Frontend
- `Dockerfile` - Frontend containerization with Nginx
- `nginx.conf` - Nginx configuration for serving React app
- `entrypoint.sh` - Runtime environment variable injection
- `src/config/env.js` - Environment configuration helper
- `index.html` - Updated to load runtime environment variables
- `.env` - Development environment variables
- `.dockerignore` - Docker build optimization
- `.gitignore` - Updated with environment files
- `src/services/taskAPI.js` - Updated to use environment configuration
- `src/services/userAPI.js` - Updated to use environment configuration

## 🚀 How to Run

### Development Mode
```bash
# Backend
cd backend
npm install
npm start

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Production Mode with Docker
```bash
# From the backend directory (where docker-compose.yml is located)
cd backend
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend on port 80

## 🔧 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3000
DB_USER=postgres
DB_PASSWORD=306200515
DB_NAME=Task_Tracker
DATABASE_URL=postgres://postgres:306200515@localhost:5432/Task_Tracker
JWT_SECRET=yasmine_jwt_secret
DB_DIALECT=postgres
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_APP_NAME=Task Tracker
REACT_APP_ENVIRONMENT=development
```

## 🔒 Security Best Practices

1. **.env files are in .gitignore** - Never commit sensitive data
2. **Production uses Docker environment variables** - Secure deployment
3. **Environment validation** - `envalid` ensures required variables are present
4. **Conditional loading** - `.env` only loaded in development

## 📋 What You Need to Do Next

1. **Test the setup**:
   ```bash
   # Test backend environment loading
   cd backend
   node -e "const env = require('./config/env'); console.log('Loaded:', env.NODE_ENV, env.PORT);"
   
   # Test Docker build
   docker-compose build
   ```

2. **Update your database connection** if needed:
   - Make sure PostgreSQL is running locally for development
   - Update database credentials in `.env` if different

3. **Test the complete stack**:
   ```bash
   cd backend
   docker-compose up
   ```

4. **Access the application**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000
   - Database: localhost:5432

## 🔍 How It Works

### Development
- Backend loads `.env` file using dotenv
- Frontend uses Vite's environment variable support
- Both applications run on separate ports

### Production (Docker)
- Backend gets environment variables from Docker Compose
- Frontend gets environment variables injected at runtime via `entrypoint.sh`
- All services run in Docker containers with proper networking
- Nginx serves the built React app and handles routing

## ✅ Benefits Achieved

1. **Proper Environment Management**: Different configurations for dev/prod
2. **Security**: No hardcoded credentials in code
3. **Scalability**: Easy to deploy in different environments
4. **Maintainability**: Centralized configuration management
5. **Production Ready**: Complete containerization with Docker Compose
