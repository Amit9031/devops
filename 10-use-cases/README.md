# 10 - Use Case Deployments

## 📦 Available Stacks

### 1. WordPress + MySQL
```bash
cd wordpress-mysql
docker compose up -d
# Access: http://localhost:8080
```

### 2. Node.js + MongoDB
```bash
cd nodejs-mongodb
docker compose up -d
# API: http://localhost:3000
# Mongo Express UI: http://localhost:8081
```

### 3. Java Spring Boot + PostgreSQL
```bash
cd springboot-postgres
docker compose up -d
# API: http://localhost:8080
# pgAdmin: http://localhost:5050
```

### 4. Full-Stack App (Nginx + React + Node + PostgreSQL + Redis)
```bash
cd fullstack-app
docker compose up -d
# Access: http://localhost
```

---

## 🧹 Common Cleanup Commands

```bash
# Stop a specific stack
docker compose down

# Stop and delete volumes (DELETE ALL DATA)
docker compose down -v

# Remove all stopped containers
docker container prune

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Nuclear option — clean everything
docker system prune -a --volumes
```

---

## 🔍 Debugging Multi-Container Apps

```bash
# Check if all containers are running
docker compose ps

# Check logs for all services
docker compose logs

# Check logs for specific service
docker compose logs backend
docker compose logs -f postgres    # follow

# Enter a container's shell
docker compose exec backend sh
docker compose exec postgres psql -U appuser appdb

# Check container networking
docker compose exec backend ping postgres
docker compose exec backend curl http://redis:6379

# Inspect a container
docker inspect <container-name>

# Network inspection
docker network ls
docker network inspect <network-name>
```
