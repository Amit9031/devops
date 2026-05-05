# 09 - Docker Compose

## 📋 What is Docker Compose?

Docker Compose lets you define and run **multi-container applications** using a single YAML file (`docker-compose.yml`).

Instead of multiple `docker run` commands, one file describes everything.

---

## 🔧 Installation

```bash
# Docker Compose V2 is built into Docker (as a plugin)
docker compose version

# Check if available
docker compose --help

# Old V1 (deprecated, still works)
docker-compose --version
```

---

## 📄 YAML Structure

```yaml
# docker-compose.yml

version: "3.9"           # Compose file version (optional in modern Compose)

services:               # Define containers (required)
  web:                  # service name
    image: nginx:alpine
    ports:
      - "8080:80"

  db:
    image: postgres:15
    volumes:
      - dbdata:/var/lib/postgresql/data

volumes:                # Named volumes
  dbdata:

networks:               # Custom networks
  frontend:
  backend:
```

---

## ⚙️ Core Compose CLI Commands

```bash
# Start all services (detached)
docker compose up -d

# Start and build images first
docker compose up -d --build

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and remove containers + volumes
docker compose down -v

# Stop and remove containers + volumes + images
docker compose down -v --rmi all

# View running services
docker compose ps

# View logs
docker compose logs
docker compose logs -f          # follow
docker compose logs web         # specific service
docker compose logs --tail=50 db

# Scale a service
docker compose up -d --scale web=3

# Execute command in service
docker compose exec web sh
docker compose exec db psql -U postgres

# Run one-off command (new container)
docker compose run --rm web node migrate.js

# Pull all images
docker compose pull

# Build images
docker compose build
docker compose build --no-cache

# Restart services
docker compose restart
docker compose restart web

# Stop without removing
docker compose stop
docker compose start
```

---

## 📝 Complete docker-compose.yml Reference

```yaml
version: "3.9"

# ============================================================
# SERVICES
# ============================================================
services:

  web:
    # Image vs Build
    image: nginx:alpine              # use pre-built image
    # OR
    build:                           # build from Dockerfile
      context: ./frontend            # build context directory
      dockerfile: Dockerfile.prod    # custom Dockerfile name
      args:                          # build args
        NODE_VERSION: "18"

    container_name: my-web           # custom container name

    # Port mapping host:container
    ports:
      - "80:80"
      - "443:443"
      - "127.0.0.1:8080:80"         # bind to specific interface

    # Environment variables
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: db                    # use service name!

    # Load from .env file
    env_file:
      - .env
      - .env.production

    # Volumes
    volumes:
      - ./static:/usr/share/nginx/html:ro  # bind mount (read-only)
      - nginx-logs:/var/log/nginx          # named volume
      - type: bind
        source: ./nginx.conf
        target: /etc/nginx/nginx.conf
        read_only: true

    # Networks
    networks:
      - frontend
      - backend

    # Dependency & startup order
    depends_on:
      db:
        condition: service_healthy   # wait for healthcheck
      redis:
        condition: service_started   # just wait for start

    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          memory: 128M

    # Restart policy
    restart: unless-stopped         # always | on-failure | no

    # Override entrypoint/command
    entrypoint: ["python", "app.py"]
    command: ["--port", "8080"]

    # Working directory
    working_dir: /app

    # Labels
    labels:
      app.version: "1.0"
      app.environment: production

    # Expose ports to other services (not host)
    expose:
      - "3000"

  # ============================================================
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}       # with default
      POSTGRES_PASSWORD: ${DB_PASSWORD}          # from .env
      POSTGRES_DB: ${DB_NAME:-myapp}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # init script
    ports:
      - "5432:5432"                              # expose for dev
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ============================================================
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

# ============================================================
# VOLUMES
# ============================================================
volumes:
  pgdata:
    driver: local
  redisdata:
    driver: local
  nginx-logs:
    driver: local

  # External volume (created outside compose)
  external-vol:
    external: true
    name: my-existing-volume

# ============================================================
# NETWORKS
# ============================================================
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true        # not accessible from host
  
  # External network
  existing-net:
    external: true
    name: my-external-network
```

---

## 🔐 Environment Variables & Secrets

```bash
# .env file (auto-loaded by compose)
DB_USER=postgres
DB_PASSWORD=supersecret
DB_NAME=myapp
NODE_ENV=production

# Reference in compose:
# environment:
#   DB_PASSWORD: ${DB_PASSWORD}
```

```yaml
# Secrets (for Swarm mode)
services:
  app:
    secrets:
      - db_password
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  # or external:
  api_key:
    external: true
```

---

## 📊 Build vs Image Fields

```yaml
services:
  # Use pre-built image from registry
  app-from-image:
    image: myusername/myapp:1.0

  # Build from local Dockerfile
  app-from-build:
    build: .                   # short form, uses ./Dockerfile

  # Build with options
  app-advanced-build:
    build:
      context: .               # build context
      dockerfile: Dockerfile   # Dockerfile to use
      args:
        BUILD_ENV: production  # build-time args
    image: myapp:latest        # tag the built image as this
```

---

## 🔗 Service Dependency Ordering

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy    # wait for healthcheck to pass
      redis:
        condition: service_started    # just wait for container to start
      migrations:
        condition: service_completed_successfully  # wait for it to exit 0

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10

  migrations:
    build: .
    command: python manage.py migrate
    depends_on:
      db:
        condition: service_healthy
    restart: "no"    # don't restart — it's a one-shot task
```

---

## 🌍 Multiple Compose Files

```bash
# Override for development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Override for production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# docker-compose.dev.yml (overrides)
# services:
#   app:
#     volumes:
#       - .:/app          # live code
#     command: npm run dev
#     environment:
#       NODE_ENV: development
```
