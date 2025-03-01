#!/bin/bash
cd /var/www/bms/backend
source venv/bin/activate
exec gunicorn conf.wsgi:application --bind 0.0.0.0:8000 --workers 4
