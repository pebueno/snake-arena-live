FROM python:3.12-slim-bookworm

# Install uv provided tools
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
# --frozen: requires uv.lock to be up to date
# --no-dev: do not install dev dependencies (optional, but good for prod)
# --no-cache: don't store cache in layer
RUN uv sync --frozen --no-dev --no-cache

# Copy the rest of the application
COPY . .

# Place the virtualenv in the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
