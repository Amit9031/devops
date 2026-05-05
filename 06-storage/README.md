# 06 - Docker Storage

## 💾 Storage Types Overview

```
Container (writable layer)
    ↕
Union Filesystem (OverlayFS)
    ↕
Image Layers (read-only)

Persistent Storage Options:
  1. Volumes     — Managed by Docker, stored in /var/lib/docker/volumes/
  2. Bind Mounts — Map host path directly to container path
  3. tmpfs       — In-memory, not persisted
```

| Feature | Volumes | Bind Mounts | tmpfs |
|---------|---------|-------------|-------|
| Host location | Docker managed | Host path | Memory |
| Persists data | ✅ Yes | ✅ Yes | ❌ No |
| Portable | ✅ Yes | ❌ No | ❌ No |
| Backup | Easy | Manual | No |
| Sharing | Easy | Possible | No |

---

## 📦 Docker Volumes

```bash
# === CREATING VOLUMES ===
docker volume create myvol
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/dir \
  nfsvol

# === LISTING & INSPECTING ===
docker volume ls
docker volume inspect myvol
# Shows Mountpoint: /var/lib/docker/volumes/myvol/_data

# === USING VOLUMES ===

# -v syntax (old style)
docker run -d -v myvol:/data nginx

# --mount syntax (new, preferred)
docker run -d \
  --mount type=volume,source=myvol,target=/data \
  nginx

# Read-only volume
docker run -d -v myvol:/data:ro nginx
docker run -d --mount type=volume,source=myvol,target=/data,readonly nginx

# === ANONYMOUS VOLUMES ===
# Created automatically when Dockerfile has VOLUME instruction
# or when you use -v /container/path (no source name)
docker run -d -v /data nginx    # anonymous volume created

# === VOLUME DEMO ===

# Create volume
docker volume create dbdata

# Write data
docker run --rm -v dbdata:/data alpine sh -c "echo 'persistent!' > /data/file.txt"

# Read from another container — data persists!
docker run --rm -v dbdata:/data alpine cat /data/file.txt
# Output: persistent!

# === BACKUP & RESTORE VOLUME ===

# Backup (tar the volume to current dir)
docker run --rm \
  -v dbdata:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/dbdata-backup.tar.gz -C /data .

# Restore
docker volume create dbdata-restored
docker run --rm \
  -v dbdata-restored:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/dbdata-backup.tar.gz -C /data

# === REMOVE VOLUMES ===
docker volume rm myvol
docker volume prune           # remove unused volumes
docker volume prune -f        # force (no prompt)
```

---

## 📁 Bind Mounts

```bash
# Map a HOST directory/file into the container
# Syntax: -v /host/path:/container/path

# === DIRECTORY BIND MOUNT ===

# Mount current directory (development workflow!)
docker run -d \
  --name dev-server \
  -v $(pwd):/app \
  -p 3000:3000 \
  node:18-alpine \
  node server.js

# Any changes to files on host are immediately visible in container
# Great for development — no need to rebuild image on code change!

# === FILE BIND MOUNT ===
docker run -d \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx

# === READ-ONLY BIND MOUNT ===
docker run -d \
  -v /host/config:/config:ro \
  myapp

# === --mount syntax ===
docker run -d \
  --mount type=bind,source=$(pwd),target=/app \
  myapp

# Read-only with --mount
docker run -d \
  --mount type=bind,source=$(pwd)/config,target=/config,readonly \
  myapp

# === PRACTICAL: Live Code Reload ===
mkdir myproject && cd myproject
cat > server.js << 'EOF'
const http = require('http');
http.createServer((req, res) => {
  res.end('Hello from host filesystem!\n');
}).listen(3000);
EOF

docker run -d \
  --name live-dev \
  -v $(pwd):/app \
  -w /app \
  -p 3000:3000 \
  node:18-alpine node server.js

curl http://localhost:3000

# Edit server.js on host, restart container (or use nodemon)
docker restart live-dev
curl http://localhost:3000

# Cleanup
docker rm -f live-dev
```

---

## 🔄 Copy-on-Write (CoW) Mechanism

```bash
# Docker images are READ-ONLY layers stacked together.
# When a container WRITES to a file, Docker:
#   1. Copies the file from the image layer to the CONTAINER layer
#   2. Modifies it there
# This is "Copy-on-Write"

# === DEMO ===

# Pull nginx (read-only layers)
docker pull nginx

# Run container (adds writable layer on top)
docker run -d --name cow-demo nginx

# File in image layer (read-only):
docker exec cow-demo cat /etc/nginx/nginx.conf

# Modify the file inside container (triggers CoW)
docker exec cow-demo sh -c "echo '# modified' >> /etc/nginx/nginx.conf"

# See what changed (A=added, C=changed, D=deleted)
docker diff cow-demo
# C /etc/nginx/nginx.conf   ← copied + modified in writable layer

# Stop and remove — changes are LOST (writable layer destroyed)
docker rm -f cow-demo

# To persist: use volumes!
```

---

## 💽 tmpfs Mount (In-Memory)

```bash
# tmpfs lives in host memory — not written to disk
# Great for sensitive data (secrets) or temp files needing speed

docker run -d \
  --mount type=tmpfs,destination=/tmp \
  --name tmpfs-demo \
  nginx

# Or using --tmpfs flag
docker run -d --tmpfs /tmp nginx

# Verify (shows tmpfs filesystem type)
docker exec tmpfs-demo df -h /tmp

# Data in /tmp does NOT persist after container stops
```

---

## 🗂️ Storage in Practice: MySQL with Volume

```bash
# Run MySQL with persistent volume
docker volume create mysql-data

docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=myapp \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0

# Wait for MySQL to be ready
sleep 10

# Create some data
docker exec mysql-db mysql -uroot -prootpass myapp \
  -e "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100)); INSERT INTO users (name) VALUES ('Alice'), ('Bob');"

# Remove the container
docker rm -f mysql-db

# Data is STILL in the volume!
docker run -d \
  --name mysql-db2 \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0

sleep 10

# Data persists!
docker exec mysql-db2 mysql -uroot -prootpass myapp \
  -e "SELECT * FROM users;"

# Cleanup
docker rm -f mysql-db2
docker volume rm mysql-data
```
