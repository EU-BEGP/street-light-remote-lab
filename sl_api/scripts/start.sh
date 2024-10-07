#!/bin/bash

# Check the environment and start the appropriate server
if [ "$ENVIRONMENT" = "production" ]; then

  echo "Starting in production mode..."

  # Wait for the database to be ready
  python manage.py wait_for_db

  # Start the MQTT listener in the background
  python manage.py robot_mqtt_listener &
  python manage.py light_mqtt_listener &

  # Start Gunicorn with UvicornWorker
  gunicorn app.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 2

elif [ "$ENVIRONMENT" = "development" ]; then

  echo "Starting in development mode..."

  # Wait for the database to be ready
  python manage.py wait_for_db

  # Start the MQTT listener in the background
  python manage.py robot_mqtt_listener &
  python manage.py light_mqtt_listener &

  # Start Uvicorn with auto-reload
  uvicorn app.asgi:application --reload --host 0.0.0.0 --port 8000
fi
