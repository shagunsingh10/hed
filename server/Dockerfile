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


# Add requirements.txt
ADD requirements.txt /app/requirements.txt

# Install dependencies from requirements.txt
RUN pip install -r requirements.txt

# Copy the contents of the current directory (where Dockerfile is located) into the container at /app
ADD . /app

# Run the specified commands when the container launches
CMD celery -A celeryapp worker -c 1 -Q ingestionqueue -n ingestionworker -l info &\
    celery -A celeryapp worker -c 2 -Q queryqueue -n queryworker -l info &\
    python main.py

