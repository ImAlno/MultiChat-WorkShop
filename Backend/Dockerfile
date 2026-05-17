# Use a lightweight, official Python runtime as base
FROM python:3.12-slim

# Set environment variables to optimize Python execution in Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker's caching layer
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the API port (3000)
EXPOSE 3000

# Start the FastAPI server using the modular app.server entrypoint
CMD ["python", "-m", "app.server"]
