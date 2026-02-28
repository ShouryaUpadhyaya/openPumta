# openPumta Backend API Documentation

This document provides an overview of the backend API for openPumta.

## Base URL

`http://localhost:4000/api`

## Authentication

The API uses Google OAuth2 for authentication. Sessions are managed via cookies (`connect.sid`).

- **Login:** `GET /auth/google` (Redirects to Google)
- **Check Auth Status:** `GET /auth/user` (Returns user info if authenticated)
- **Logout:** `POST /auth/logout`

## Core Resources

### 1. Subjects

Subjects are the high-level categories for your focus sessions (e.g., "Math", "Coding").

- `GET /subject/:userId` - Get all subjects for a user.
- `POST /subject` - Create a new subject.
- `PATCH /subject/:subjectId/startTimer` - Start a focus log for a subject.
- `PATCH /subject/:subjectId/endTimer` - End the active focus log.

### 2. Habits

Daily habits based on the Huberman protocol.

- `GET /habits/user/:userId` - Get all habits for a user.
- `POST /habits` - Create a new habit.
- `POST /habits/:habitId/start` - Start tracking a habit session.
- `POST /habits/:habitId/end` - End a habit tracking session.

### 3. ToDos

Simple task management.

- `GET /todo/user/:userId` - List all ToDos for a user.
- `POST /todo/create` - Create a new ToDo.
- `PATCH /todo/:id` - Update a ToDo.
- `DELETE /todo/:id` - Remove a ToDo.

## Error Handling

The API returns structured error responses:

```json
{
  "statusCode": 404,
  "data": null,
  "message": "Resource not found",
  "success": false
}
```

## OpenAPI Specification

A full OpenAPI 3.0 spec is available in [openapi.yaml](./openapi.yaml).
