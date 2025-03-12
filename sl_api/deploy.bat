@echo off

:: Exit immediately if a command fails
setlocal enabledelayedexpansion
set EXIT_CODE=0

echo.
echo [BUILDING DOCKER IMAGE]
docker-compose build || set EXIT_CODE=1

if !EXIT_CODE! NEQ 0 exit /b %EXIT_CODE%

echo.
echo [RUNNING DATABASE MIGRATIONS]
docker-compose run --rm app python manage.py makemigrations || set EXIT_CODE=1
docker-compose run --rm app python manage.py migrate || set EXIT_CODE=1

if !EXIT_CODE! NEQ 0 exit /b %EXIT_CODE%

set STATICFILES_DIR=.\app\staticfiles\

:: Check if the static files directory exists
if not exist "!STATICFILES_DIR!" (
    echo.
    echo Static files directory does not exist.
    echo Creating...
    docker-compose run --rm app python manage.py collectstatic || set EXIT_CODE=1
)

if !EXIT_CODE! NEQ 0 exit /b %EXIT_CODE%

echo.
echo [RUNNING THE APPLICATION]
docker-compose up
