#!/bin/bash

# Function to start the server
start_server() {
    echo "Starting development server..."
    npm start
}

# Keep trying to restart the server if it crashes
while true; do
    start_server
    echo "Server stopped. Restarting in 2 seconds..."
    sleep 2
done 