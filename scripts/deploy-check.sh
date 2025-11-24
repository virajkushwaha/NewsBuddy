#!/bin/bash

echo "🚀 Starting NewsBuddy deployment verification..."

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "Checking $service_name..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is healthy"
            return 0
        fi
        echo "⏳ Waiting for $service_name... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    echo "❌ $service_name failed to start"
    return 1
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

# Start services in order
echo "📦 Starting MongoDB and Redis..."
docker-compose up -d mongodb redis

# Wait for databases
sleep 15

echo "🔧 Starting Backend..."
docker-compose up -d backend

# Check backend health
if check_service "Backend" "http://localhost:5000/health"; then
    echo "🎨 Starting Frontend..."
    docker-compose up -d frontend
    
    # Check frontend health
    if check_service "Frontend" "http://localhost:3000/health"; then
        echo "🎉 All services are running successfully!"
        echo ""
        echo "📊 Service Status:"
        docker-compose ps
        echo ""
        echo "🌐 Access URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:5000"
        echo "  Health:   http://localhost:5000/health"
        echo ""
        echo "📋 Container Logs:"
        echo "  Backend:  docker-compose logs -f backend"
        echo "  Frontend: docker-compose logs -f frontend"
    else
        echo "❌ Frontend failed to start"
        docker-compose logs frontend
        exit 1
    fi
else
    echo "❌ Backend failed to start"
    docker-compose logs backend
    exit 1
fi