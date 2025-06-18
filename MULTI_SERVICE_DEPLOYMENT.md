# Multi-Service Deployment Guide

This guide explains how to deploy the Food Ordering System using individual docker-compose files for each service, managed by a bash/batch script.

## Overview

Instead of using a single comprehensive docker-compose file, this approach uses:
- **4 separate docker-compose files** (one for each service)
- **1 management script** to orchestrate all services
- **Better isolation** and **independent scaling** of services

## Architecture

```
Food-Ordering-System/
├── backend/
│   ├── user-service/
│   │   └── docker-compose.yml      # Django + PostgreSQL
│   ├── menu-service/
│   │   └── docker-compose.yml      # Node.js + MongoDB
│   └── order-service/
│       └── docker-compose.yml      # Node.js + MongoDB
├── frontend/
│   └── restaurant/
│       └── docker-compose.yml      # React/Vite
├── run-all-services.sh             # Linux/macOS script
└── run-all-services.bat            # Windows script
```

## Prerequisites

- **Docker** and **Docker Compose** installed
- **4 individual docker-compose.yml files** (one for each service)
- **Bash** (Linux/macOS) or **Command Prompt** (Windows)

## Quick Start

### Linux/macOS
```bash
# Make script executable
chmod +x run-all-services.sh

# Start all services
./run-all-services.sh start

# Check status
./run-all-services.sh status

# View logs
./run-all-services.sh logs
```

### Windows
```cmd
# Start all services
run-all-services.bat start

# Check status
run-all-services.bat status

# View logs
run-all-services.bat logs
```

## Available Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `start` | Start all services sequentially (recommended) |
| `start-concurrent` | Start all services concurrently |
| `stop` | Stop all services |
| `restart` | Restart all services |
| `status` | Show status of all services |
| `logs` | Show logs from all services |
| `health` | Check health of all services |
| `clean` | Stop and remove all containers, volumes, and images |
| `help` | Show help message |

### Examples

```bash
# Start all services (recommended for first run)
./run-all-services.sh start

# Start services concurrently (faster but may have dependency issues)
./run-all-services.sh start-concurrent

# Check if all services are running
./run-all-services.sh status

# View recent logs from all services
./run-all-services.sh logs

# Check health of all services
./run-all-services.sh health

# Stop all services
./run-all-services.sh stop

# Clean up everything (containers, volumes, images)
./run-all-services.sh clean
```

## Service URLs

Once all services are running:

- **Frontend**: http://localhost:3000
- **User Service**: http://localhost:8000
- **Menu Service**: http://localhost:3001
- **Order Service**: http://localhost:3002

### Health Check URLs

- **User Service**: http://localhost:8000/api/health/
- **Menu Service**: http://localhost:3001/health
- **Order Service**: http://localhost:3002/health

## Deployment Modes

### 1. Sequential Deployment (Recommended)

```bash
./run-all-services.sh start
```

**Process:**
1. Stop any existing services
2. Start User Service (Django + PostgreSQL)
3. Wait for User Service to be ready
4. Start Menu Service (Node.js + MongoDB)
5. Wait for Menu Service to be ready
6. Start Order Service (Node.js + MongoDB)
7. Wait for Order Service to be ready
8. Start Frontend (React/Vite)
9. Check health of all services

**Benefits:**
- ✅ Ensures proper startup order
- ✅ Handles dependencies correctly
- ✅ Better error handling
- ✅ Health checks between services

### 2. Concurrent Deployment

```bash
./run-all-services.sh start-concurrent
```

**Process:**
1. Stop any existing services
2. Start all services simultaneously
3. Wait for all services to complete startup

**Benefits:**
- ✅ Faster startup time
- ✅ Parallel processing

**Drawbacks:**
- ❌ May have dependency issues
- ❌ Harder to debug startup problems

## Individual Service Management

You can also manage services individually by going to their directories:

```bash
# User Service
cd backend/user-service
docker-compose up -d
docker-compose logs
docker-compose down

# Menu Service
cd backend/menu-service
docker-compose up -d
docker-compose logs
docker-compose down

# Order Service
cd backend/order-service
docker-compose up -d
docker-compose logs
docker-compose down

# Frontend
cd frontend/restaurant
docker-compose up -d
docker-compose logs
docker-compose down
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using the ports
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Stop conflicting services
./run-all-services.sh stop
```

#### 2. Docker Compose Files Not Found
```bash
# Check if all docker-compose files exist
ls backend/*/docker-compose.yml
ls frontend/*/docker-compose.yml
```

#### 3. Services Not Starting
```bash
# Check logs for specific service
cd backend/user-service && docker-compose logs
cd backend/menu-service && docker-compose logs
cd backend/order-service && docker-compose logs
cd frontend/restaurant && docker-compose logs
```

#### 4. Health Check Failures
```bash
# Check if services are responding
curl http://localhost:8000/api/health/
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3000/
```

### Debug Mode

For detailed debugging, you can run services individually:

```bash
# Start with verbose output
cd backend/user-service
docker-compose up  # Remove -d flag to see logs in real-time
```

## Environment Variables

Each service should have its own environment variables configured in their respective docker-compose files:

### User Service
```yaml
environment:
  - DEBUG=False
  - DB_HOST=postgres
  - DB_PORT=5432
  - CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Menu Service
```yaml
environment:
  - NODE_ENV=production
  - MONGODB_URI=mongodb://mongodb:27017/food_ordering_menu
  - USER_SERVICE_URL=http://localhost:8000
```

### Order Service
```yaml
environment:
  - NODE_ENV=production
  - MONGODB_URI=mongodb://mongodb:27017/food_ordering_orders
  - USER_SERVICE_URL=http://localhost:8000
  - MENU_SERVICE_URL=http://localhost:3001
```

### Frontend
```yaml
environment:
  - VITE_API_URL=http://localhost:8000/api
  - VITE_MENU_SERVICE_URL=http://localhost:3001
  - VITE_ORDER_SERVICE_URL=http://localhost:3002
```

## Production Considerations

### 1. Use Proper Domain Names
Replace `localhost` with actual domain names:
```yaml
VITE_API_URL=https://api.yourdomain.com
VITE_MENU_SERVICE_URL=https://menu.yourdomain.com
```

### 2. Use Reverse Proxy
Consider using nginx or traefik to route all services through a single domain:
```yaml
# Example nginx configuration
location /api/ {
    proxy_pass http://user-service:8000;
}

location /menu/ {
    proxy_pass http://menu-service:3001;
}
```

### 3. Use Environment-Specific Scripts
Create different scripts for different environments:
```bash
run-all-services-dev.sh    # Development
run-all-services-staging.sh # Staging
run-all-services-prod.sh   # Production
```

### 4. Add Monitoring
Consider adding monitoring and logging:
```bash
# Add to script
docker-compose -f monitoring/docker-compose.yml up -d
```

## Advantages of This Approach

### ✅ Benefits
- **Independent scaling**: Scale services individually
- **Better isolation**: Services don't interfere with each other
- **Easier debugging**: Isolated logs and configurations
- **Flexible deployment**: Deploy services independently
- **Team development**: Different teams can work on different services
- **Resource management**: Allocate resources per service

### ❌ Drawbacks
- **More complex**: Multiple docker-compose files to manage
- **Coordination needed**: Need to ensure proper startup order
- **More scripts**: Additional management overhead

## Comparison with Single Docker Compose

| Aspect | Single docker-compose.yml | Multiple docker-compose files |
|--------|---------------------------|-------------------------------|
| **Simplicity** | ✅ Simple | ❌ More complex |
| **Isolation** | ❌ Shared network | ✅ Isolated networks |
| **Scaling** | ❌ All or nothing | ✅ Individual scaling |
| **Debugging** | ❌ Mixed logs | ✅ Isolated logs |
| **Team Development** | ❌ Conflicts possible | ✅ Independent work |
| **Resource Management** | ❌ Shared resources | ✅ Per-service resources |

## Next Steps

1. **Test the deployment**: Run `./run-all-services.sh start`
2. **Verify all services**: Check health endpoints
3. **Test the application**: Navigate to http://localhost:3000
4. **Monitor logs**: Use `./run-all-services.sh logs`
5. **Customize configurations**: Modify individual docker-compose files as needed

This approach gives you maximum flexibility and control over your microservices architecture! 