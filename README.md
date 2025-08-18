# Task Tracker
A full-stack, production-ready Task Tracker application for managing tasks, tracking time, and analyzing productivity. Built with a React + Vite frontend, Node.js/Express backend, PostgreSQL database, and complete Docker containerization.

## Features
-User authentication (signup, login, JWT-based sessions)

-CRUD operations for tasks (title, description, status, priority, due date, time logging)

-Time tracking and analytics per task

-User profile management and account deletion

-Modern, responsive React UI

-RESTful API with Swagger documentation

-Comprehensive logging (Winston, Morgan)

-Environment variable management for dev/prod

-Fully containerized with Docker & Docker Compose
## Tech Stack
-Frontend: React, Vite, Nginx (for production)


-Backend: Node.js, Express, Sequelize ORM

-Database: PostgreSQL

-Auth: JWT

-Logging: Winston, Morgan

-Containerization: Docker, Docker Compose

## Getting Started
### Backend

cd backend 

npm install

npm start

### Frontend (in a new terminal)

cd frontend

npm install

npm run dev

## Development
-Production (Docker)

-Frontend: http://localhost:5173

-Backend API: http://localhost:3000

-Database: localhost:5432

-Environment Variables
### See ENVIRONMENT_SETUP.md for details.

## API Documentation
Swagger UI available at: http://localhost:3000/api-docs

## Logging
-All logs: backend/logs/combined.log

-Errors: backend/logs/error.log
### See LOGGING_IMPLEMENTATION.md for details.

## Security
-Secrets and credentials are managed via environment variables and never committed to source control.

-Production uses Docker secrets and environment validation.

## Contributing
Pull requests are welcome! For major changes, please open an issue first.

Let me know if you want any changes or want these files created in your repo!
