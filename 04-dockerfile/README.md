# 04 - Dockerfile & Image Building

## 📋 Dockerfile Core Concepts

### What is a Dockerfile?
A text file with instructions to **build a Docker image** layer by layer. Each instruction creates a new layer.

### Build Context
The **build context** is the directory sent to the Docker daemon when you run `docker build`.

```bash
# Build context = current directory (.)
docker build .

# Build context = specific directory
docker build /path/to/context

# Build context = remote Git repo
docker build https://github.com/user/repo.git
```

---

## 📄 .dockerignore

Exclude files from the build context (like `.gitignore`):

```
# .dockerignore
node_modules/
*.log
.git/
.env
__pycache__/
*.pyc
dist/
.DS_Store
Dockerfile
.dockerignore
README.md
tests/
```

```bash
# Check what's in build context (before building)
# Large build context = slower builds
```

---

## 📝 Dockerfile Instructions - Complete Reference

```dockerfile
# ============================================================
# FROM — Base image (MUST be first instruction)
# ============================================================
FROM ubuntu:22.04
FROM python:3.11-slim          # slim = smaller base
FROM node:18-alpine            # alpine = minimal (5MB)
FROM scratch                   # empty base (for Go static binaries)

# Multi-stage: use alias
FROM node:18 AS builder
FROM nginx:alpine AS production


# ============================================================
# LABEL — Metadata (key=value pairs)
# ============================================================
LABEL maintainer="yourname@email.com"
LABEL version="1.0"
LABEL description="My application"
LABEL org.opencontainers.image.source="https://github.com/user/repo"


# ============================================================
# ARG — Build-time variables (NOT available at runtime)
# ============================================================
ARG NODE_VERSION=18
ARG APP_PORT=3000
FROM node:${NODE_VERSION}

# Pass at build time:
# docker build --build-arg NODE_VERSION=20 .


# ============================================================
# ENV — Environment variables (available at build AND runtime)
# ============================================================
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_HOST=localhost DB_PORT=5432   # multiple on one line

# Access in container: echo $NODE_ENV
# Override at runtime: docker run -e NODE_ENV=development myapp


# ============================================================
# WORKDIR — Set working directory (creates if doesn't exist)
# ============================================================
WORKDIR /app
WORKDIR /usr/src/app

# All subsequent RUN, COPY, ADD, CMD, ENTRYPOINT use this dir


# ============================================================
# COPY — Copy files from build context to image
# ============================================================
COPY . .                           # copy everything
COPY package.json .                # single file
COPY package*.json ./              # wildcard
COPY src/ /app/src/                # directory
COPY --chown=node:node . .         # with ownership
COPY --from=builder /app/dist ./   # multi-stage copy


# ============================================================
# ADD — Like COPY but with extra features (prefer COPY usually)
# ============================================================
ADD . .
ADD https://example.com/file.tar.gz /tmp/   # fetch URL
ADD archive.tar.gz /app/                    # auto-extracts tar

# Best practice: use COPY unless you need ADD's extra features


# ============================================================
# RUN — Execute commands during BUILD (creates a layer)
# ============================================================

# Shell form (runs via /bin/sh -c)
RUN apt-get update && apt-get install -y curl vim

# Best practice: combine apt commands to reduce layers
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl \
      vim \
      git && \
    rm -rf /var/lib/apt/lists/*        # clean apt cache!

# Exec form (no shell, no variable expansion)
RUN ["apt-get", "install", "-y", "curl"]

# Alpine / apk
RUN apk add --no-cache curl git

# Python
RUN pip install --no-cache-dir -r requirements.txt

# Node.js
RUN npm ci --only=production


# ============================================================
# EXPOSE — Document which port the container listens on
# ============================================================
EXPOSE 3000
EXPOSE 8080/tcp
EXPOSE 53/udp

# NOTE: EXPOSE is just documentation! Actual port mapping is done with -p flag.
# docker run -p 8080:3000 myapp


# ============================================================
# VOLUME — Declare a mount point for persistent data
# ============================================================
VOLUME /data
VOLUME /var/lib/mysql
VOLUME ["/data", "/logs"]   # multiple volumes


# ============================================================
# USER — Set the user for subsequent RUN/CMD/ENTRYPOINT
# ============================================================
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Or use UID
USER 1001


# ============================================================
# CMD — Default command when container starts (can be overridden)
# ============================================================

# Exec form (preferred)
CMD ["node", "server.js"]
CMD ["python", "app.py"]
CMD ["nginx", "-g", "daemon off;"]

# Shell form
CMD node server.js

# Only the LAST CMD takes effect
# Override: docker run myapp python other.py


# ============================================================
# ENTRYPOINT — Main command that always runs (harder to override)
# ============================================================

# Exec form (preferred)
ENTRYPOINT ["python", "app.py"]
ENTRYPOINT ["/docker-entrypoint.sh"]

# Override entrypoint: docker run --entrypoint bash myapp

# CMD + ENTRYPOINT combo:
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]
# CMD provides default args to ENTRYPOINT
# docker run myapp           → python app.py --port 8080
# docker run myapp --port 9000  → python app.py --port 9000


# ============================================================
# HEALTHCHECK — Test if container is healthy
# ============================================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

HEALTHCHECK NONE   # disable inherited healthcheck


# ============================================================
# ONBUILD — Trigger for child images
# ============================================================
ONBUILD COPY . /app
ONBUILD RUN npm install
```

---

## 🏗️ Docker Build Process

```bash
# Basic build
docker build -t myapp .
docker build -t myapp:1.0 .

# Build with different Dockerfile name
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build args
docker build --build-arg APP_PORT=8080 -t myapp .

# Build without cache (force fresh build)
docker build --no-cache -t myapp .

# Build for specific platform
docker build --platform linux/amd64 -t myapp .

# Multi-platform build (requires buildx)
docker buildx build --platform linux/amd64,linux/arm64 -t myapp --push .

# Verbose output
docker build --progress=plain -t myapp .
```

---

## 🏷️ Image Tagging & Versioning

```bash
# Convention: registry/username/image:tag

# Tag during build
docker build -t myapp:latest .
docker build -t myapp:1.0.0 .
docker build -t myapp:1.0 .
docker build -t myapp:1 .

# Tag existing image
docker tag myapp:latest myapp:1.0.0
docker tag myapp:latest myregistry.io/myapp:1.0.0

# Semantic versioning
docker tag myapp:latest myapp:1.2.3
docker tag myapp:latest myapp:1.2
docker tag myapp:latest myapp:1

# Push with tag
docker push myapp:1.0.0
docker push myapp:latest
```

---

## 🔍 Inspecting Images

```bash
# View image history (layers)
docker history myapp
docker history myapp --no-trunc     # full commands, no truncation
docker history myapp --format "table {{.ID}}\t{{.CreatedBy}}\t{{.Size}}"

# Inspect full metadata
docker inspect myapp
docker inspect myapp --format '{{.Config.Env}}'     # environment vars
docker inspect myapp --format '{{.Config.Cmd}}'     # default command
docker inspect myapp --format '{{.RootFS.Layers}}'  # layer hashes

# Image size breakdown
docker images myapp
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

---

## 📦 Complete Dockerfile Examples

### Example 1: Node.js App

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first (layer caching optimization)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Example 2: Python Flask App

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

EXPOSE 5000

ENV FLASK_ENV=production

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]
```

### Example 3: Multi-Stage Build (Node.js)

```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build         # produces /app/dist

# Stage 2: Production (much smaller!)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Example 4: Java Spring Boot

```dockerfile
# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🧹 Build Cache & Optimization Tips

```bash
# Layer caching — Docker reuses unchanged layers
# Order matters! Put less-changing layers first:

# ✅ GOOD: dependencies before source code
COPY package.json .
RUN npm install
COPY . .           # only this invalidates cache when code changes

# ❌ BAD: dependencies mixed with source
COPY . .
RUN npm install    # re-runs every time ANY file changes

# Check cache hit/miss during build
docker build --progress=plain -t myapp .
# "CACHED" = layer was reused
```
