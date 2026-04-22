# Backend Intern Assignment

Scalable REST API with JWT auth, role-based access, and a React UI for testing.

## Stack
- Backend: Node.js, Express, Prisma, Postgres, JWT, Zod, Swagger
- Frontend: React, Vite

## Backend setup
1. Copy `backend/.env.example` to `backend/.env` and set values.
2. Install dependencies:
   - `cd backend`
   - `npm install`
3. Run migrations and generate Prisma client:
   - `npx prisma migrate dev --name init`
4. Start the API:
   - `npm run dev`

API base URL: `http://localhost:4000/api/v1`
Swagger docs: `http://localhost:4000/api/v1/docs`

## Frontend setup
1. Copy `frontend/.env.example` to `frontend/.env`.
2. Install dependencies:
   - `cd frontend`
   - `npm install`
3. Start the UI:
   - `npm run dev`

Frontend runs on `http://localhost:5173`.

## Roles
- Default role is `user`.
- To register an admin, provide `role: "admin"` and an `adminSecret` that matches `ADMIN_REGISTRATION_SECRET`.

## Scalability note
- Stateless API + JWT enables horizontal scaling behind a load balancer.
- Postgres indexes on `email` and `ownerId` support user and task lookups.
- Caching layer (e.g. Redis) can reduce reads for popular task queries.
- Separate auth and task modules to support future service split.
# Assignment Overview

This repo contains a Node.js + MySQL REST API with JWT auth and role-based access, plus a React UI to test the APIs.

## Features
- User registration and login with bcrypt and JWT
- Role-based access: user vs admin
- CRUD for tasks
- Validation, error handling, API versioning
- Swagger docs at /api-docs
- React UI for auth and tasks

## Project Structure
- backend/
- frontend/

## Backend Setup
1. cd backend
2. cp .env.example .env
3. Update MYSQL_* and JWT_SECRET
4. npm install
5. npm run dev

## Database Setup (MySQL)
1. Ensure MySQL is running.
2. Create the schema using [backend/schema.sql](backend/schema.sql) or run `npm run db:setup` in backend.

## Frontend Setup
1. cd frontend
2. cp .env.example .env (optional)
3. npm install
4. npm run dev

## API
Base URL: http://localhost:4000/api/v1
Swagger UI: http://localhost:4000/api-docs

Endpoints:
- POST /auth/register
- POST /auth/login
- GET /users/me
- GET /users (admin only)
- GET /tasks
- POST /tasks
- GET /tasks/:id
- PUT /tasks/:id
- DELETE /tasks/:id

## Notes
- The frontend stores the JWT in localStorage for demo purposes. For production, use httpOnly cookies.
- To create an admin, update the user role in the MySQL `users` table.

## Scalability Note
This codebase separates routes, controllers, services, and models to keep features modular. For scale, you can split services by domain, add a caching layer (Redis) for hot reads, run stateless API servers behind a load balancer, and move long-running jobs to a queue worker.
