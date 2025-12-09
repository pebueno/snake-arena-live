# Snake Arena Live

A real-time multiplayer implementation of the classic Snake game.
**Architecture**: Unified Docker Container (FastAPI Backend serving React Frontend) + PostgreSQL.

## Project Structure

- **backend/**: FastAPI application (Python 3.12).
- **frontend/**: React application (Vite, TypeScript, Tailwind CSS).
- **Dockerfile**: Unified multi-stage build for the entire app.
- **docker-compose.yml**: Orchestration for the App + Database.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker (Recommended)

1.  **Build and Start:**
    ```bash
    docker compose up --build
    ```
    *Note: This builds the React frontend and the Python backend into a single container.*

2.  **Access the Application:**
    - **App:** [http://localhost:8080](http://localhost:8080)
    - **API Docs:** [http://localhost:8080/docs](http://localhost:8080/docs)

### Database & Seeding

- Uses **PostgreSQL** 15 in Docker.
- **Auto-Seeding**: The app automatically seeds mock data on startup.
- **Mock Users**:
    - `SnakeMaster` / `password`
    - `PixelPython` / `password`

### Troubleshooting

- **Database Errors?** If you changed the schema or see date/time errors, reset the database:
    ```bash
    docker compose down -v
    docker compose up --build
    ```

## Features

- **Consolidated Deployment:** Single container for specific version management.
- **Real-time Gameplay:** (In progress)
- **Leaderboard:** Compete for high scores.
