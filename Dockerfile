FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Ensure model PKL is generated if missing
RUN python train_model.py

# Expose port
EXPOSE 5000

ENV PORT=5000
ENV FLASK_DEBUG=False

# Run with Gunicorn production server
CMD ["gunicorn", "app:app", "--workers", "4", "--threads", "2", "--timeout", "120", "--bind", "0.0.0.0:5000"]
