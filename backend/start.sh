#!/bin/bash

# SafeZonePH Backend Startup Script

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the FastAPI server
echo "Starting SafeZonePH API server..."
cd app
python main.py