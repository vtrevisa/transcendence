#!/bin/sh
makemigrations.sh
echo 'Executando migrate.sh'
python manage.py migrate --noinput
python manage.py migrate blog --noinput