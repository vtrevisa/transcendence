#!/bin/sh
echo 'Executando makemigrations.sh'
python manage.py makemigrations --noinput
python manage.py makemigrations blog --noinput
