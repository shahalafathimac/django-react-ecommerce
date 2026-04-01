#!/bin/sh
set -e

DB_HOST="${HOST:-db}"
DB_PORT="${PORT:-5432}"

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

python manage.py migrate --noinput

exec "$@"
