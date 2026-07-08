FROM python:3.12-slim
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --locked
COPY src ./src
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "127.0.0.1", "--port", "8000"]
