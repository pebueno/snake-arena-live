# Snake Arena Backend

This is the FastAPI backend for the Snake Arena game.

## Setup

1.  **Install uv**: This project uses `uv` for dependency management.
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```

2.  **Install dependencies**:
    ```bash
    uv sync
    ```

## Running the Project

To start the development server:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
You can view the interactive API documentation at `http://localhost:8000/docs`.

## Running Tests

To run the test suite:

```bash
uv run pytest
```
