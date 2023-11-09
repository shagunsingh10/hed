# Use the official Python image from Docker Hub as the base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Create and set the working directory
WORKDIR /app

# Copy the contents of the current directory (where Dockerfile is located) into the container at /app
COPY . /app

# Install dependencies from requirements.txt
RUN pip install -r requirements.txt

# Run the specified commands when the container launches
CMD celery -A celeryapp.app worker -l info  & python servicequeue.py
