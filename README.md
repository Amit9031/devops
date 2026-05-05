# 🐳 Docker & Containers - Complete Practical Guide

> A comprehensive reference of all Docker commands, concepts, and practical examples covered in the course.

---

## 📁 Folder Structure

```
docker-practicals/
├── 01-intro/                  # Introduction to Containers
├── 02-container-runtime/      # Container Runtime & Process Isolation
├── 03-docker-basics/          # Docker Architecture & CLI
├── 04-dockerfile/             # Dockerfile & Image Building
├── 05-networking/             # Docker Networking
├── 06-storage/                # Docker Storage (Volumes & Bind Mounts)
├── 07-registries/             # Image Registries
├── 08-microservices/          # Microservices Architecture
├── 09-docker-compose/         # Docker Compose
└── 10-use-cases/              # Multi-container App Deployments
```

---

## 🚀 Quick Reference - Most Used Commands

```bash
# Pull & run an image
docker pull nginx
docker run -d -p 8080:80 --name my-nginx nginx

# List containers & images
docker ps -a
docker images

# Build from Dockerfile
docker build -t myapp:1.0 .

# Compose up
docker compose up -d
docker compose down
```

---

## 📚 Topics Covered

1. Origin of containers & history
2. Container runtime, namespaces, cgroups
3. Docker Architecture (daemon, CLI, registry)
4. Docker objects: image, container, network, volume
5. Dockerfile writing & image building
6. Docker Networking (bridge, host, overlay)
7. Docker Storage (volumes, bind mounts, copy-on-write)
8. Image registries (Docker Hub, GHCR, private)
9. Microservices vs Monolithic
10. Docker Compose YAML
11. Real-world multi-container deployments
