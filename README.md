# Elice Learning Platform

A full-stack web application that integrates with external APIs to create a comprehensive learning experience. Students can search for learning resources, save content, and track their progress.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + Python + SQLite
- **External API**: Open Library for educational content

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Run the Application

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Access the Application
- Frontend: http://localhost:3000 (Docker) / http://localhost:5173 (Development)
- Backend API: http://localhost:8000
- API Health Check: http://localhost:8000/api/health

### Stop the Application
```bash
docker-compose down
```

## Development Setup

### Backend Setup
See `server/README.md` for detailed instructions.

### Frontend Setup
See `client/README.md` for detailed instructions.

## API Documentation

See `docs/api.md` for comprehensive API documentation and architecture analysis.

## Integration Strategy

See `docs/integration.md` for external API integration details and security considerations.

## Features

- **Search**: Find educational resources using Open Library API
- **YouTube Integration**: Search and watch C++ programming videos
- **Save**: Bookmark resources and videos for later reference
- **Progress**: Track learning progress with status and percentage
- **Session Management**: Cookie-based user sessions
- **Responsive Design**: Modern UI that works on all devices

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Modern CSS with responsive design

### Backend
- FastAPI for high-performance API
- SQLAlchemy for database ORM
- SQLite for data persistence
- httpx for external API calls
- Pydantic for data validation

### External Services
- Open Library Search API for educational content
- YouTube Data API v3 for C++ programming videos

## Docker Services

- **backend**: FastAPI application on port 8000
- **frontend**: Nginx serving React app on port 3000
- **networks**: Internal Docker network for service communication
- **volumes**: Persistent data storage for SQLite database
