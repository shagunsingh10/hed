# Use the official Python image from Docker Hub as the base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Create and set the working directory
WORKDIR /app

# Add requirements.txt
ADD requirements.txt /app/requirements.txt

# Install dependencies from requirements.txt
RUN pip install -r requirements.txt
RUN pip install langchain-community
# Copy the contents of the current directory (where Dockerfile is located) into the container at /app
ADD . /app

EXPOSE 8000

# Run the specified commands when the container launches
CMD python main.py