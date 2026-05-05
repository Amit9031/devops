# 05 - Docker Networking

## 🌐 Network Types Overview

| Network Driver | Use Case |
|---------------|----------|
| **bridge** | Default — isolated containers on same host |
| **host** | Container uses host network directly |
| **overlay** | Multi-host communication (Swarm/K8s) |
| **none** | No network — fully isolated |
| **macvlan** | Container gets its own MAC/IP on physical network |

---

## 🔵 Bridge Network (Default)

Every container on the default bridge can communicate by IP but NOT by name.
Custom bridge networks support **DNS-based name resolution**.

```bash
# === DEFAULT BRIDGE NETWORK ===

# Inspect the default bridge
docker network inspect bridge

# Run two containers on default bridge
docker run -d --name c1 alpine sleep 3600
docker run -d --name c2 alpine sleep 3600

# Get IPs
docker inspect c1 --format '{{.NetworkSettings.IPAddress}}'   # e.g. 172.17.0.2
docker inspect c2 --format '{{.NetworkSettings.IPAddress}}'   # e.g. 172.17.0.3

# Ping by IP (works on default bridge)
docker exec c1 ping -c 3 172.17.0.3

# Ping by name (FAILS on default bridge — no DNS)
docker exec c1 ping c2     # This will FAIL

# Clean up
docker rm -f c1 c2


# === CUSTOM BRIDGE NETWORK ===

# Create a custom network
docker network create mynet
docker network create --driver bridge mynet
docker network create --subnet=192.168.100.0/24 --gateway=192.168.100.1 mynet2

# Run containers on custom network
docker run -d --name app1 --network mynet alpine sleep 3600
docker run -d --name app2 --network mynet alpine sleep 3600

# DNS works on custom bridge!
docker exec app1 ping -c 3 app2    # Uses container name — WORKS!

# Connect a container to an additional network
docker network connect mynet c1

# Disconnect from network
docker network disconnect mynet app1

# List all networks
docker network ls

# Inspect network
docker network inspect mynet

# Remove network
docker network rm mynet
docker network prune    # remove all unused networks

# Clean up
docker rm -f app1 app2
```

---

## 🔴 Host Network

Container shares host's network stack — no isolation, best performance.

```bash
# Run with host network (Linux only — not supported on Mac/Windows)
docker run -d --network host nginx

# nginx now uses host's port 80 directly — no port mapping needed
# Verify:
curl http://localhost:80

# WARNING: Port conflicts are possible since container uses host ports directly

# Check listening ports
docker exec <container> netstat -tlnp
```

---

## 🟡 Overlay Network (Multi-host / Swarm)

Used when containers run on **different hosts** and need to communicate.

```bash
# Overlay requires Swarm mode or Kubernetes

# Initialize Swarm
docker swarm init

# Create overlay network
docker network create --driver overlay my-overlay

# Deploy service on overlay
docker service create --name web --network my-overlay nginx

# Inspect overlay
docker network inspect my-overlay

# Leave Swarm
docker swarm leave --force
```

---

## 🔍 DNS Inside Docker

```bash
# Custom bridge networks have automatic DNS
# DNS server: 127.0.0.11 (Docker's embedded DNS)

docker network create testnet

docker run -d --name server --network testnet nginx
docker run -it --rm --network testnet alpine sh

# Inside the alpine container:
nslookup server           # Resolves container name → IP
cat /etc/resolv.conf      # Shows nameserver 127.0.0.11
ping server               # Works!
wget -qO- http://server   # Connects to nginx

# Custom hostname & aliases
docker run -d --name myapp --network testnet \
  --hostname webapp \
  --network-alias app --network-alias service \
  nginx

# Other containers can reach myapp as: myapp, webapp, app, or service
```

---

## 🔗 Linking Containers (Legacy)

```bash
# --link is DEPRECATED — use custom networks instead
# Shown here for reference only

docker run -d --name db mysql:8
docker run -d --name app --link db:database myapp

# Prefer this instead:
docker network create appnet
docker run -d --name db --network appnet mysql:8
docker run -d --name app --network appnet myapp
# app can reach db using hostname "db"
```

---

## 🔌 Port Mapping

```bash
# Syntax: docker run -p <host_port>:<container_port>

# Map host port 8080 to container port 80
docker run -d -p 8080:80 nginx
curl http://localhost:8080

# Map all interfaces (default)
docker run -d -p 8080:80 nginx

# Map specific interface
docker run -d -p 127.0.0.1:8080:80 nginx   # localhost only

# Map UDP port
docker run -d -p 53:53/udp dns-server

# Map multiple ports
docker run -d -p 80:80 -p 443:443 nginx

# Random host port (-P maps all EXPOSE'd ports)
docker run -d -P nginx
docker port <container>     # see assigned ports

# View port mappings
docker port mycontainer
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Port mapping examples
docker run -d --name web -p 8080:80 nginx
docker run -d --name api -p 3000:3000 node-app
docker run -d --name db  -p 5432:5432 postgres
```

---

## 🧪 Networking Lab

```bash
# Full lab: two services communicating over custom network

# Create network
docker network create lab-net

# Start a "database" container
docker run -d \
  --name lab-db \
  --network lab-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=testdb \
  mysql:8.0

# Start a "backend" container that connects to db
docker run -d \
  --name lab-backend \
  --network lab-net \
  -p 3000:3000 \
  -e DB_HOST=lab-db \
  -e DB_PORT=3306 \
  node:18-alpine sleep 3600

# Test DNS resolution
docker exec lab-backend ping -c 3 lab-db    # resolves by name!

# Check network config
docker network inspect lab-net

# Clean up
docker rm -f lab-db lab-backend
docker network rm lab-net
```
