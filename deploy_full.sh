#!/bin/bash
set -e

echo "========================================="
echo "  Phase 3: Production Configuration"
echo "========================================="

# 3.1 - Update Backend .env for production
cat > /var/www/orovia/Backend/.env << 'ENVEOF'
SECRET_KEY=django-insecure-i3$6usnsdn5uk%r81b-rok%h7w9ba_uke#el8l-okd+#l7h6hs
ENGINE=django.db.backends.postgresql
NAME=ecommerce
USER=postgres
PASSWORD=12345
HOST=db
PORT=5432
RAZORPAY_KEY_ID=rzp_test_SZ2F93cclttsHJ
RAZORPAY_KEY_SECRET=hb0jXHTTMUJtdn1ACIa6qc1A
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=shahalafathima213@gmail.com
EMAIL_HOST_PASSWORD=eymacgocfarsyype
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=shahalafathima213@gmail.com
PASSWORD_RESET_URL=http://54.160.63.101/reset-password/{uid}/{token}
GOOGLE_CLIENT_ID=137816180693-gq3mromtakvjh4rkkostmje6oebk8beu.apps.googleusercontent.com
DEBUG=FALSE
ENVEOF
echo "Backend .env updated"

# 3.2 - Update Django settings.py for production CORS/ALLOWED_HOSTS
cd /var/www/orovia/Backend
sed -i "s/ALLOWED_HOSTS = .*/ALLOWED_HOSTS = ['54.160.63.101', 'localhost', '127.0.0.1']/" core/settings.py

# Update CORS_ALLOWED_ORIGINS
python3 -c "
import re
with open('core/settings.py', 'r') as f:
    content = f.read()

# Replace CORS_ALLOWED_ORIGINS
content = re.sub(
    r\"CORS_ALLOWED_ORIGINS = \[.*?\]\",
    \"\"\"CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://54.160.63.101',
]\"\"\",
    content,
    flags=re.DOTALL
)

# Replace CSRF_TRUSTED_ORIGINS
content = re.sub(
    r\"CSRF_TRUSTED_ORIGINS = \[.*?\]\",
    \"\"\"CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://54.160.63.101',
]\"\"\",
    content,
    flags=re.DOTALL
)

with open('core/settings.py', 'w') as f:
    f.write(content)
print('settings.py updated')
"

# 3.3 - Update docker-compose.yml for production
cat > /var/www/orovia/docker-compose.yml << 'DCEOF'
version: "3.9"

services:
  db:
    image: postgres:15-alpine
    container_name: ecommerce-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: "12345"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d ecommerce"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./Backend
    container_name: ecommerce-backend
    restart: unless-stopped
    env_file:
      - ./Backend/.env
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    command: gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120

volumes:
  postgres_data:
  static_volume:
  media_volume:
DCEOF
echo "docker-compose.yml updated"

# 3.4 - Fix entrypoint.sh line endings (Windows CRLF -> Unix LF)
sed -i 's/\r$//' /var/www/orovia/Backend/docker/entrypoint.sh
chmod +x /var/www/orovia/Backend/docker/entrypoint.sh
echo "entrypoint.sh fixed"

# Fix line endings on all Python files
find /var/www/orovia/Backend -name "*.py" -exec sed -i 's/\r$//' {} +
echo "Python files CRLF fixed"

echo "Phase 3 COMPLETE"

echo ""
echo "========================================="
echo "  Phase 4: Build React Frontend"
echo "========================================="

cd /var/www/orovia/Frontend

# Remove the Data/node_modules that got uploaded
rm -rf /var/www/orovia/Frontend/src/Data/node_modules 2>/dev/null || true

npm install
echo "npm install done"

npm run build
echo "Frontend build done"

ls -la /var/www/orovia/Frontend/dist/
echo "Phase 4 COMPLETE"

echo ""
echo "========================================="
echo "  Phase 5: Configure Nginx"
echo "========================================="

sudo tee /etc/nginx/sites-available/orovia << 'NGINXEOF'
server {
    listen 80;
    server_name 54.160.63.101;

    # React frontend (SPA)
    root /var/www/orovia/Frontend/dist;
    index index.html;

    # API — proxy to Django/Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django static files (admin CSS/JS)
    location /static/ {
        alias /var/www/orovia/staticfiles/;
    }

    # SPA fallback — all non-file routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;

    client_max_body_size 10M;
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/orovia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
echo "Phase 5 COMPLETE"

echo ""
echo "========================================="
echo "  Phase 6: Start Docker Services"
echo "========================================="

cd /var/www/orovia

# Need newgrp to pick up docker group membership
sudo docker compose up -d --build
echo "Docker containers starting..."

# Wait for containers to be healthy
echo "Waiting for database to be healthy..."
sleep 15

sudo docker compose ps
echo ""

# Collect static files
echo "Collecting static files..."
sudo docker compose exec -T backend python manage.py collectstatic --noinput

# Copy static files from container to host path Nginx expects
sudo mkdir -p /var/www/orovia/staticfiles
sudo docker cp ecommerce-backend:/app/staticfiles /var/www/orovia/staticfiles_tmp
sudo cp -r /var/www/orovia/staticfiles_tmp/* /var/www/orovia/staticfiles/ 2>/dev/null || sudo cp -r /var/www/orovia/staticfiles_tmp/. /var/www/orovia/staticfiles/
sudo rm -rf /var/www/orovia/staticfiles_tmp

echo "Static files copied"

# Load database fixture
echo "Loading database fixture..."
sudo docker compose exec -T backend python manage.py loaddata db.json || echo "Note: db.json load had issues (might be expected if data already exists)"

echo ""
echo "Phase 6 COMPLETE"

echo ""
echo "========================================="
echo "  Phase 7: Verification"
echo "========================================="

echo "Test 1 - Frontend:"
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost/
echo ""

echo "Test 2 - API:"
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost/api/products/
echo ""

echo "Test 3 - Admin:"
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost/admin/
echo ""

echo "Test 4 - Docker containers:"
sudo docker compose ps
echo ""

echo "========================================="
echo "  DEPLOYMENT COMPLETE!"
echo "  Visit: http://54.160.63.101"
echo "========================================="
