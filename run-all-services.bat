@echo off
setlocal enabledelayedexpansion

REM Food Ordering System - Multi Docker Compose Runner (Windows)
REM This script runs all 4 docker-compose files

echo Food Ordering System - Multi Service Runner
echo ==============================================

REM Check command line arguments
if "%1"=="start" goto start
if "%1"=="start-concurrent" goto start-concurrent
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="logs" goto logs
if "%1"=="health" goto health
if "%1"=="clean" goto clean
if "%1"=="help" goto help
if "%1"=="-h" goto help
if "%1"=="--help" goto help

echo [ERROR] Unknown command: %1
echo Run 'run-all-services.bat help' for usage information
exit /b 1

:help
echo Usage: %0 [command]
echo.
echo Commands:
echo   start           - Start all services sequentially (recommended)
echo   start-concurrent- Start all services concurrently
echo   stop            - Stop all services
echo   restart         - Restart all services
echo   status          - Show status of all services
echo   logs            - Show logs from all services
echo   health          - Check health of all services
echo   clean           - Stop and remove all containers, volumes, and images
echo   help            - Show this help message
echo.
echo Examples:
echo   %0 start        # Start all services (recommended)
echo   %0 status       # Check service status
echo   %0 logs         # View logs
echo   %0 health       # Check health
echo.
echo Service URLs:
echo   Frontend:       http://localhost:3000
echo   User Service:   http://localhost:8000
echo   Menu Service:   http://localhost:3001
echo   Order Service:  http://localhost:3002
exit /b 0

REM Service directories
set USER_SERVICE_DIR=backend\user-service
set MENU_SERVICE_DIR=backend\menu-service
set ORDER_SERVICE_DIR=backend\order-service
set FRONTEND_DIR=frontend\restaurant

:check-prerequisites
echo [INFO] Checking prerequisites...

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo [SUCCESS] Prerequisites check completed
goto :eof

:check-compose-files
echo [INFO] Checking docker-compose files...

if not exist "%USER_SERVICE_DIR%\docker-compose.yml" (
    echo [ERROR] User service docker-compose.yml not found at %USER_SERVICE_DIR%\
    exit /b 1
)

if not exist "%MENU_SERVICE_DIR%\docker-compose.yml" (
    echo [ERROR] Menu service docker-compose.yml not found at %MENU_SERVICE_DIR%\
    exit /b 1
)

if not exist "%ORDER_SERVICE_DIR%\docker-compose.yml" (
    echo [ERROR] Order service docker-compose.yml not found at %ORDER_SERVICE_DIR%\
    exit /b 1
)

if not exist "%FRONTEND_DIR%\docker-compose.yml" (
    echo [ERROR] Frontend docker-compose.yml not found at %FRONTEND_DIR%\
    exit /b 1
)

echo [SUCCESS] All docker-compose files found
goto :eof

:stop-all-services
echo [INFO] Stopping all services...

echo [FRONTEND] Stopping...
cd /d "%FRONTEND_DIR%" && docker-compose down 2>nul

echo [ORDER] Stopping...
cd /d "%ORDER_SERVICE_DIR%" && docker-compose down 2>nul

echo [MENU] Stopping...
cd /d "%MENU_SERVICE_DIR%" && docker-compose down 2>nul

echo [USER] Stopping...
cd /d "%USER_SERVICE_DIR%" && docker-compose down 2>nul

cd /d "%~dp0"
echo [SUCCESS] All services stopped
goto :eof

:start-user-service
echo [USER] Starting User Service (Django)...
cd /d "%USER_SERVICE_DIR%"

docker-compose build --no-cache
docker-compose up -d

echo [USER] Waiting for User Service to be ready...
timeout /t 15 /nobreak >nul

cd /d "%~dp0"
goto :eof

:start-menu-service
echo [MENU] Starting Menu Service (Node.js)...
cd /d "%MENU_SERVICE_DIR%"

docker-compose build --no-cache
docker-compose up -d

echo [MENU] Waiting for Menu Service to be ready...
timeout /t 10 /nobreak >nul

cd /d "%~dp0"
goto :eof

:start-order-service
echo [ORDER] Starting Order Service (Node.js)...
cd /d "%ORDER_SERVICE_DIR%"

docker-compose build --no-cache
docker-compose up -d

echo [ORDER] Waiting for Order Service to be ready...
timeout /t 10 /nobreak >nul

cd /d "%~dp0"
goto :eof

:start-frontend
echo [FRONTEND] Starting Frontend (React/Vite)...
cd /d "%FRONTEND_DIR%"

docker-compose build --no-cache
docker-compose up -d

echo [FRONTEND] Waiting for Frontend to be ready...
timeout /t 10 /nobreak >nul

cd /d "%~dp0"
goto :eof

:start
call :check-prerequisites
call :check-compose-files
call :stop-all-services

echo [INFO] Starting services sequentially (recommended for first run)...
call :start-user-service
call :start-menu-service
call :start-order-service
call :start-frontend

echo [SUCCESS] All services started sequentially
call :check-all-health
call :show-urls
goto :eof

:start-concurrent
call :check-prerequisites
call :check-compose-files
call :stop-all-services

echo [INFO] Starting services concurrently...

REM Start all services in separate windows
start "User Service" cmd /k "cd /d %USER_SERVICE_DIR% && docker-compose build --no-cache && docker-compose up"
start "Menu Service" cmd /k "cd /d %MENU_SERVICE_DIR% && docker-compose build --no-cache && docker-compose up"
start "Order Service" cmd /k "cd /d %ORDER_SERVICE_DIR% && docker-compose build --no-cache && docker-compose up"
start "Frontend" cmd /k "cd /d %FRONTEND_DIR% && docker-compose build --no-cache && docker-compose up"

echo [SUCCESS] All services started in separate windows
echo [INFO] Close the command windows to stop individual services
call :show-urls
goto :eof

:stop
call :stop-all-services
goto :eof

:restart
call :check-prerequisites
call :check-compose-files
call :stop-all-services

echo [INFO] Starting services sequentially...
call :start-user-service
call :start-menu-service
call :start-order-service
call :start-frontend

echo [SUCCESS] All services restarted
call :check-all-health
call :show-urls
goto :eof

:status
echo.
echo 📊 Service Status:
echo ==================

echo.
echo [USER] Status:
cd /d "%USER_SERVICE_DIR%" && docker-compose ps
cd /d "%~dp0"

echo.
echo [MENU] Status:
cd /d "%MENU_SERVICE_DIR%" && docker-compose ps
cd /d "%~dp0"

echo.
echo [ORDER] Status:
cd /d "%ORDER_SERVICE_DIR%" && docker-compose ps
cd /d "%~dp0"

echo.
echo [FRONTEND] Status:
cd /d "%FRONTEND_DIR%" && docker-compose ps
cd /d "%~dp0"
goto :eof

:logs
echo.
echo 📋 Recent logs (last 10 lines each):
echo =====================================

echo.
echo [USER] Logs:
cd /d "%USER_SERVICE_DIR%" && docker-compose logs --tail=10
cd /d "%~dp0"

echo.
echo [MENU] Logs:
cd /d "%MENU_SERVICE_DIR%" && docker-compose logs --tail=10
cd /d "%~dp0"

echo.
echo [ORDER] Logs:
cd /d "%ORDER_SERVICE_DIR%" && docker-compose logs --tail=10
cd /d "%~dp0"

echo.
echo [FRONTEND] Logs:
cd /d "%FRONTEND_DIR%" && docker-compose logs --tail=10
cd /d "%~dp0"
goto :eof

:check-all-health
echo [INFO] Checking all services health...

echo.
echo 🔍 Health Check Results:
echo ========================

REM Note: Windows doesn't have curl by default, so we'll just show the URLs
echo [INFO] Health check URLs:
echo User Service:    http://localhost:8000/api/health/
echo Menu Service:    http://localhost:3001/health
echo Order Service:   http://localhost:3002/health
echo Frontend:        http://localhost:3000/

echo.
goto :eof

:show-urls
echo.
echo 🌐 Service URLs:
echo ================
echo Frontend:        http://localhost:3000
echo User Service:    http://localhost:8000
echo Menu Service:    http://localhost:3001
echo Order Service:   http://localhost:3002
echo.
echo 📊 Health Checks:
echo User Service:    http://localhost:8000/api/health/
echo Menu Service:    http://localhost:3001/health
echo Order Service:   http://localhost:3002/health
echo.
goto :eof

:clean
echo [INFO] Cleaning up everything...
call :stop-all-services

REM Remove all containers, networks, and volumes
cd /d "%USER_SERVICE_DIR%" && docker-compose down --volumes --remove-orphans 2>nul
cd /d "%MENU_SERVICE_DIR%" && docker-compose down --volumes --remove-orphans 2>nul
cd /d "%ORDER_SERVICE_DIR%" && docker-compose down --volumes --remove-orphans 2>nul
cd /d "%FRONTEND_DIR%" && docker-compose down --volumes --remove-orphans 2>nul

REM Clean up Docker system
docker system prune -f

cd /d "%~dp0"
echo [SUCCESS] Cleanup completed
goto :eof

:health
call :check-all-health
goto :eof 