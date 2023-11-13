# Use the official Python image from Docker Hub as the base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Create and set the working directory
WORKDIR /app

# Install build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    gcc \
    g++

# # Download script
# ADD scripts/download_model.sh /app/download_model.sh
# RUN chmod +x /app/download_model.sh

# # Download the model if it doesn't exist
# RUN /app/download_model.sh

# Add requirements.txt
ADD requirements.txt /app/requirements.txt

# Install dependencies from requirements.txt
RUN pip install -r requirements.txt

# Copy the contents of the current directory (where Dockerfile is located) into the container at /app
ADD . /app

# Run the specified commands when the container launches
CMD celery -A services.doc_remover.app worker -c 1 -Q docremoverqueue -l info & \
    celery -A services.ingestion.app worker -c 1 -Q ingestorqueue -l info & \
    celery -A services.query_processor.app worker -c 1 -Q queryprocessorqueue -l info & \
    python servicequeue.py
