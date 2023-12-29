#!/bin/bash

# Start ray serve app on port 8001
serve run api.retrieval:serveapp --port 8001 &
# Store the PID of the first background process
PID1=$!

# Start ingestion app on port 8002
uvicorn api.ingestion:app --port 8002 &
# Store the PID of the second background process
PID2=$!

# Wait for 15 seconds to ensure services are up
sleep 15

# Start Nginx with the custom configuration
nginx -c $(pwd)/nginx.conf



# Find and kill the process running on port 8001
# kill -9 $(lsof -t -i:8001)

# Find and kill the process running on port 8002
# kill -9 $(lsof -t -i:8002)

# sudo systemctl stop nginx
