#!/bin/bash

# Food Ordering System - Multi Docker Compose Runner
# This script runs all 4 docker-compose files concurrently

set -e  # Exit on any error

echo "🍕 Food Ordering System - Multi Service Runner"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_service() {
    echo -e "${PURPLE}[$1]${NC} $2"
}

print_db() {
    echo -e "${CYAN}[DATABASE]${NC} $1"
}

# Service directories
USER_SERVICE_DIR="backend/user-service"
MENU_SERVICE_DIR="backend/menu-service"
ORDER_SERVICE_DIR="backend/order-service"
FRONTEND_DIR="frontend/restaurant"

# PID storage
PIDS=()

# Function to check if Docker and Docker Compose are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Function to check if docker-compose files exist
check_compose_files() {
    print_status "Checking docker-compose files..."
    
    if [ ! -f "$USER_SERVICE_DIR/docker-compose.yml" ]; then
        print_error "User service docker-compose.yml not found at $USER_SERVICE_DIR/"
        exit 1
    fi
    
    if [ ! -f "$MENU_SERVICE_DIR/docker-compose.yml" ]; then
        print_error "Menu service docker-compose.yml not found at $MENU_SERVICE_DIR/"
        exit 1
    fi
    
    if [ ! -f "$ORDER_SERVICE_DIR/docker-compose.yml" ]; then
        print_error "Order service docker-compose.yml not found at $ORDER_SERVICE_DIR/"
        exit 1
    fi
    
    if [ ! -f "$FRONTEND_DIR/docker-compose.yml" ]; then
        print_error "Frontend docker-compose.yml not found at $FRONTEND_DIR/"
        exit 1
    fi
    
    print_success "All docker-compose files found"
}

# Function to stop all services
stop_all_services() {
    print_status "Stopping all services..."
    
    # Stop services in reverse order (frontend first, then backend services)
    print_service "FRONTEND" "Stopping..."
    cd "$FRONTEND_DIR" && docker-compose down 2>/dev/null || true
    
    print_service "ORDER" "Stopping..."
    cd "$ORDER_SERVICE_DIR" && docker-compose down 2>/dev/null || true
    
    print_service "MENU" "Stopping..."
    cd "$MENU_SERVICE_DIR" && docker-compose down 2>/dev/null || true
    
    print_service "USER" "Stopping..."
    cd "$USER_SERVICE_DIR" && docker-compose down 2>/dev/null || true
    
    cd - > /dev/null 2>&1
    print_success "All services stopped"
}

# Function to start user service
start_user_service() {
    print_service "USER" "Starting User Service (Django)..."
    cd "$USER_SERVICE_DIR"
    
    # Build and start
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for service to be ready
    print_service "USER" "Waiting for User Service to be ready..."
    sleep 15
    
    # Check health
    if curl -f http://localhost:8000/api/health/ >/dev/null 2>&1; then
        print_success "User Service is healthy"
    else
        print_warning "User Service health check failed, but continuing..."
    fi
    
    cd - > /dev/null 2>&1
}

# Function to start menu service
start_menu_service() {
    print_service "MENU" "Starting Menu Service (Node.js)..."
    cd "$MENU_SERVICE_DIR"
    
    # Build and start
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for service to be ready
    print_service "MENU" "Waiting for Menu Service to be ready..."
    sleep 10
    
    # Check health
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        print_success "Menu Service is healthy"
    else
        print_warning "Menu Service health check failed, but continuing..."
    fi
    
    cd - > /dev/null 2>&1
}

# Function to start order service
start_order_service() {
    print_service "ORDER" "Starting Order Service (Node.js)..."
    cd "$ORDER_SERVICE_DIR"
    
    # Build and start
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for service to be ready
    print_service "ORDER" "Waiting for Order Service to be ready..."
    sleep 10
    
    # Check health
    if curl -f http://localhost:3002/health >/dev/null 2>&1; then
        print_success "Order Service is healthy"
    else
        print_warning "Order Service health check failed, but continuing..."
    fi
    
    cd - > /dev/null 2>&1
}

# Function to start frontend
start_frontend() {
    print_service "FRONTEND" "Starting Frontend (React/Vite)..."
    cd "$FRONTEND_DIR"
    
    # Build and start
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for service to be ready
    print_service "FRONTEND" "Waiting for Frontend to be ready..."
    sleep 10
    
    # Check health
    if curl -f http://localhost:3000/ >/dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed, but continuing..."
    fi
    
    cd - > /dev/null 2>&1
}

# Function to start all services sequentially (recommended for first run)
start_services_sequential() {
    print_status "Starting services sequentially (recommended for first run)..."
    
    # Start in dependency order
    start_user_service
    start_menu_service
    start_order_service
    start_frontend
    
    print_success "All services started sequentially"
}

# Function to start all services concurrently
start_services_concurrent() {
    print_status "Starting services concurrently..."
    
    # Start User Service in background
    (start_user_service) &
    USER_PID=$!
    PIDS+=($USER_PID)
    
    # Start Menu Service in background
    (start_menu_service) &
    MENU_PID=$!
    PIDS+=($MENU_PID)
    
    # Start Order Service in background
    (start_order_service) &
    ORDER_PID=$!
    PIDS+=($ORDER_PID)
    
    # Start Frontend in background
    (start_frontend) &
    FRONTEND_PID=$!
    PIDS+=($FRONTEND_PID)
    
    # Wait for all services to start
    print_status "Waiting for all services to start..."
    wait $USER_PID $MENU_PID $ORDER_PID $FRONTEND_PID
    
    print_success "All services started concurrently"
}

# Function to check all services health
check_all_health() {
    print_status "Checking all services health..."
    
    echo ""
    echo "🔍 Health Check Results:"
    echo "========================"
    
    # Check User Service
    if curl -f http://localhost:8000/api/health/ >/dev/null 2>&1; then
        print_success "User Service: ✅ Healthy (http://localhost:8000)"
    else
        print_error "User Service: ❌ Unhealthy"
    fi
    
    # Check Menu Service
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        print_success "Menu Service: ✅ Healthy (http://localhost:3001)"
    else
        print_error "Menu Service: ❌ Unhealthy"
    fi
    
    # Check Order Service
    if curl -f http://localhost:3002/health >/dev/null 2>&1; then
        print_success "Order Service: ✅ Healthy (http://localhost:3002)"
    else
        print_error "Order Service: ❌ Unhealthy"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000/ >/dev/null 2>&1; then
        print_success "Frontend: ✅ Healthy (http://localhost:3000)"
    else
        print_error "Frontend: ❌ Unhealthy"
    fi
    
    echo ""
}

# Function to show service URLs
show_urls() {
    echo ""
    echo "🌐 Service URLs:"
    echo "================"
    echo "Frontend:        http://localhost:3000"
    echo "User Service:    http://localhost:8000"
    echo "Menu Service:    http://localhost:3001"
    echo "Order Service:   http://localhost:3002"
    echo ""
    echo "📊 Health Checks:"
    echo "User Service:    http://localhost:8000/api/health/"
    echo "Menu Service:    http://localhost:3001/health"
    echo "Order Service:   http://localhost:3002/health"
    echo ""
}

# Function to show logs
show_logs() {
    echo ""
    echo "📋 Recent logs (last 10 lines each):"
    echo "====================================="
    
    echo ""
    print_service "USER" "Logs:"
    cd "$USER_SERVICE_DIR" && docker-compose logs --tail=10
    cd - > /dev/null 2>&1
    
    echo ""
    print_service "MENU" "Logs:"
    cd "$MENU_SERVICE_DIR" && docker-compose logs --tail=10
    cd - > /dev/null 2>&1
    
    echo ""
    print_service "ORDER" "Logs:"
    cd "$ORDER_SERVICE_DIR" && docker-compose logs --tail=10
    cd - > /dev/null 2>&1
    
    echo ""
    print_service "FRONTEND" "Logs:"
    cd "$FRONTEND_DIR" && docker-compose logs --tail=10
    cd - > /dev/null 2>&1
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Service Status:"
    echo "=================="
    
    print_service "USER" "Status:"
    cd "$USER_SERVICE_DIR" && docker-compose ps
    cd - > /dev/null 2>&1
    
    echo ""
    print_service "MENU" "Status:"
    cd "$MENU_SERVICE_DIR" && docker-compose ps
    cd - > /dev/null 2>&1
    
    echo ""
    print_service "ORDER" "Status:"
    cd "$ORDER_SERVICE_DIR" && docker-compose ps
    cd - > /dev/null 2>&1
    
    echo ""
    print_service "FRONTEND" "Status:"
    cd "$FRONTEND_DIR" && docker-compose ps
    cd - > /dev/null 2>&1
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    stop_all_services
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
case "${1:-}" in
    "start")
        check_prerequisites
        check_compose_files
        stop_all_services
        start_services_sequential
        check_all_health
        show_urls
        ;;
    "start-concurrent")
        check_prerequisites
        check_compose_files
        stop_all_services
        start_services_concurrent
        check_all_health
        show_urls
        ;;
    "stop")
        stop_all_services
        ;;
    "restart")
        check_prerequisites
        check_compose_files
        stop_all_services
        start_services_sequential
        check_all_health
        show_urls
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "health")
        check_all_health
        ;;
    "clean")
        print_status "Cleaning up everything..."
        stop_all_services
        
        # Remove all containers, networks, and volumes
        cd "$USER_SERVICE_DIR" && docker-compose down --volumes --remove-orphans 2>/dev/null || true
        cd "$MENU_SERVICE_DIR" && docker-compose down --volumes --remove-orphans 2>/dev/null || true
        cd "$ORDER_SERVICE_DIR" && docker-compose down --volumes --remove-orphans 2>/dev/null || true
        cd "$FRONTEND_DIR" && docker-compose down --volumes --remove-orphans 2>/dev/null || true
        
        # Clean up Docker system
        docker system prune -f
        
        cd - > /dev/null 2>&1
        print_success "Cleanup completed"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start           - Start all services sequentially (recommended)"
        echo "  start-concurrent- Start all services concurrently"
        echo "  stop            - Stop all services"
        echo "  restart         - Restart all services"
        echo "  status          - Show status of all services"
        echo "  logs            - Show logs from all services"
        echo "  health          - Check health of all services"
        echo "  clean           - Stop and remove all containers, volumes, and images"
        echo "  help            - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 start        # Start all services (recommended)"
        echo "  $0 status       # Check service status"
        echo "  $0 logs         # View logs"
        echo "  $0 health       # Check health"
        echo ""
        echo "Service URLs:"
        echo "  Frontend:       http://localhost:3000"
        echo "  User Service:   http://localhost:8000"
        echo "  Menu Service:   http://localhost:3001"
        echo "  Order Service:  http://localhost:3002"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac 