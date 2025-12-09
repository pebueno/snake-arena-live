# Stage 1: Build Frontend
FROM node:20-alpine as frontend_build
WORKDIR /frontend_app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Create Python Runtime
FROM python:3.12-slim-bookworm

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1

WORKDIR /app

# Install Backend Dependencies
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-cache

# Copy Backend Code
COPY backend/ .

# Copy Frontend Build Artifacts to Backend Static Directory
COPY --from=frontend_build /frontend_app/dist /app/app/static

# Run the application using uv
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]