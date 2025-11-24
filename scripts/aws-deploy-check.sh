#!/bin/bash

echo "🚀 AWS NewsBuddy deployment verification..."

# Get instance metadata
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 Instance IP: $INSTANCE_IP"

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=60
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

# Check all services
echo "🔍 Checking all services..."

# Check MongoDB
if check_service "MongoDB" "http://localhost:27017"; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB check failed"
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis check failed"
fi

# Check Backend
if check_service "Backend API" "http://localhost:5000/health"; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API check failed"
    docker-compose logs backend
fi

# Check Frontend
if check_service "Frontend" "http://localhost:22/health"; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend check failed"
    docker-compose logs frontend
fi

echo ""
echo "📊 Final Status:"
docker-compose ps

echo ""
echo "🌐 Access URLs:"
echo "  Frontend: http://$INSTANCE_IP:22"
echo "  Backend:  http://$INSTANCE_IP:5000"
echo "  Health:   http://$INSTANCE_IP:5000/health"

echo ""
echo "🔧 Troubleshooting:"
echo "  View logs: docker-compose logs -f [service]"
echo "  Restart:   docker-compose restart [service]"
echo "  Status:    docker-compose ps"