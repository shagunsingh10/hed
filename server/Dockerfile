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

EXPOSE 8000

# Deploy serve app
ENTRYPOINT [ "serve", "run", "main:app" ]


# # Build serve app
# RUN serve build api.base:app -o serve_config.yaml

# ray start --head --port=6379  --dashboard-host=0.0.0.0 --dashboard-port=8265 & 
# ray start --head --port=6380 --dashboard-host=0.0.0.0 --dashboard-port=8265 --storage=file:///home/azureuser