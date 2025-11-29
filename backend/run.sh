#!/bin/bash

# Quick setup and run script for backend

set -e

echo "🚀 Solar Loan AI Backend Setup"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are up
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo "✅ Services are running"

# Run migrations
echo "🗄️  Running database migrations..."
alembic upgrade head

echo ""
echo "✅ Backend is ready!"
echo ""
echo "📚 API Documentation: http://localhost:8000/api/docs"
echo "🏥 Health Check: http://localhost:8000/health"
echo ""
echo "To view logs: docker-compose logs -f backend"
echo "To stop: docker-compose down"

