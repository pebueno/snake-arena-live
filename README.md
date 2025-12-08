# Snake Arena Live

A real-time multiplayer implementation of the classic Snake game, built with a FastAPI backend and a React/Vite frontend.

## Project Structure

- **backend/**: FastAPI application (Python 3.12).
- **frontend/**: React application (Vite, TypeScript, Tailwind CSS).
- **docker-compose.yml**: Orchestration for the full stack (Frontend, Backend, PostgreSQL).

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker (Recommended)

The easiest way to run the application is using Docker Compose. This will start the frontend, backend, and a PostgreSQL database.

1.  **Build and Start the containers:**
    ```bash
    docker compose up --build
    ```

2.  **Access the Application:**
    - **Frontend:** [http://localhost:8080](http://localhost:8080)
    - **API Documentation:** [http://localhost:8080/docs](http://localhost:8080/docs) (Proxied via Nginx) or [http://localhost:8000/docs](http://localhost:8000/docs) (Direct).

### Database & Seeding

The application uses PostgreSQL when running in Docker.

- **Auto-Seeding:** The database is automatically populated with mock data (users, leaderboard scores) on startup. verify this by checking the logs for "Seeding database..." or by logging in with one of the mock users.
- **Mock Users:**
    - **Username:** `SnakeMaster` / **Password:** `password`
    - **Username:** `PixelPython` / **Password:** `password`
    - *(See `backend/app/seed.py` for more)*

### Local Development

If you prefer to run services locally without Docker:

**Backend:**
```bash
cd backend
# Install dependencies
uv sync
# Run server (defaults to SQLite)
uv run uvicorn app.main:app --reload
```
*To seed the SQLite DB locally:* `uv run python -m app.seed`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Features

- **Real-time Gameplay:** (In progress)
- **Leaderboard:** Compete for high scores.
- **Authentication:** User signup and login.
- **Dockerized:** Easy deployment with Nginx reverse proxy.
