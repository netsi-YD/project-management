#!/bin/sh
set -e

PORT="${PORT:-80}"

# Update Apache to listen on the PORT environment variable
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# Run database migrations and link storage
php artisan migrate --force
php artisan storage:link || true

exec apache2-foreground
