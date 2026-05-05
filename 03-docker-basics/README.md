# 03 - Docker Architecture, Daemon, CLI & Objects

## 🏛️ Docker Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Client (CLI)                   │
│              docker build / run / push / pull            │
└──────────────────────────┬──────────────────────────────┘
                           │  REST API (Unix socket or TCP)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Docker Daemon (dockerd)                  │
│  • Manages images, containers, networks, volumes         │
│  • Listens on /var/run/docker.sock                       │
└────────────┬─────────────────────────┬───────────────────┘
             │                         │
             ▼                         ▼
    ┌────────────────┐       ┌──────────────────┐
    │   containerd   │       │   Docker Registry │
    │  (runtime mgr) │       │   (Docker Hub /   │
    └───────┬────────┘       │   private reg)    │
            │                └──────────────────┘
            ▼
         ┌──────┐
         │ runc │  ← actually starts containers
         └──────┘
```

### Components
| Component | Role |
|-----------|------|
| **dockerd** | Docker daemon — core background service |
| **containerd** | Container lifecycle management |
| **runc** | OCI runtime — creates/runs containers |
| **docker CLI** | User-facing command line tool |
| **Docker Registry** | Stores and distributes images |

---

## 🔧 Docker Daemon

```bash
# Check daemon status
sudo systemctl status docker

# Start / stop / restart daemon
sudo systemctl start docker
sudo systemctl stop docker
sudo systemctl restart docker

# View daemon logs
sudo journalctl -u docker -f

# Daemon config file location
cat /etc/docker/daemon.json

# Example daemon.json configuration
# {
#   "log-driver": "json-file",
#   "log-opts": { "max-size": "10m", "max-file": "3" },
#   "default-address-pools": [{"base":"172.80.0.0/16","size":24}],
#   "insecure-registries": ["myregistry.local:5000"]
# }

# Check docker socket
ls -la /var/run/docker.sock

# Docker system info
docker info
docker version
```

---

## 💻 Docker CLI - Complete Command Reference

### Image Commands

```bash
# Pull images
docker pull ubuntu                  # latest tag
docker pull ubuntu:22.04            # specific tag
docker pull ubuntu:22.04 --platform linux/amd64  # specific platform

# List images
docker images
docker images -a                    # include intermediate layers
docker images --filter "dangling=true"  # untagged images

# Inspect image
docker inspect ubuntu
docker inspect ubuntu --format '{{.Architecture}}'
docker history ubuntu               # show layer history
docker history ubuntu --no-trunc    # full commands

# Remove images
docker rmi ubuntu                   # remove image
docker rmi ubuntu:22.04
docker image prune                  # remove dangling images
docker image prune -a               # remove ALL unused images

# Tag an image
docker tag ubuntu:22.04 myubuntu:custom
docker tag myapp:latest myapp:1.0.0

# Save / Load images (for offline transfer)
docker save nginx -o nginx.tar
docker load -i nginx.tar
```

### Container Commands

```bash
# Run containers
docker run nginx                    # foreground
docker run -d nginx                 # detached (background)
docker run -it ubuntu bash          # interactive terminal
docker run --name mycontainer nginx # custom name
docker run --rm nginx               # auto-remove on stop
docker run -p 8080:80 nginx         # port mapping host:container
docker run -P nginx                 # random host port mapping
docker run -e ENV_VAR=value nginx   # environment variable
docker run -v /host/path:/container/path nginx  # bind mount
docker run --network mynet nginx    # custom network

# List containers
docker ps                           # running
docker ps -a                        # all (including stopped)
docker ps -q                        # only IDs
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Container lifecycle
docker start mycontainer
docker stop mycontainer             # graceful stop (SIGTERM)
docker kill mycontainer             # force stop (SIGKILL)
docker restart mycontainer
docker pause mycontainer
docker unpause mycontainer

# Interact with running container
docker exec mycontainer ls /app     # run command
docker exec -it mycontainer bash    # interactive shell
docker attach mycontainer           # attach to main process
docker logs mycontainer             # view logs
docker logs -f mycontainer          # follow logs
docker logs --tail 50 mycontainer   # last 50 lines

# Inspect containers
docker inspect mycontainer
docker inspect mycontainer --format '{{.NetworkSettings.IPAddress}}'
docker stats mycontainer            # live resource usage
docker top mycontainer              # running processes
docker port mycontainer             # port mappings

# Copy files
docker cp mycontainer:/app/file.txt ./file.txt    # from container
docker cp ./file.txt mycontainer:/app/file.txt    # to container

# Remove containers
docker rm mycontainer               # remove stopped container
docker rm -f mycontainer            # force remove running
docker container prune              # remove all stopped containers
```

### System Commands

```bash
# System-wide info
docker info                         # system info
docker version                      # client/server versions
docker system df                    # disk usage
docker system prune                 # clean up everything unused
docker system prune -a              # more aggressive cleanup
docker system prune --volumes       # also remove volumes
docker events                       # real-time events stream
```

---

## 📦 Docker Object Types

### 1. Images

```bash
# An image is a READ-ONLY template with layered filesystem

docker pull alpine
docker images alpine

# Image ID is based on content hash (SHA256)
docker inspect alpine --format '{{.Id}}'
```

### 2. Containers

```bash
# A container = running instance of an image
# It has a WRITABLE layer on top of image layers

docker run -d --name demo alpine sleep 3600
docker inspect demo --format '{{.State.Status}}'
```

### 3. Networks

```bash
# Networks enable container communication

docker network ls
docker network create mynet
docker network inspect bridge

# Connect/disconnect
docker network connect mynet demo
docker network disconnect mynet demo
docker network rm mynet
```

### 4. Volumes

```bash
# Volumes = persistent storage managed by Docker

docker volume ls
docker volume create myvol
docker volume inspect myvol
docker volume rm myvol
docker volume prune            # remove unused volumes

# Use volume in container
docker run -d -v myvol:/data alpine sleep 3600
```

---

## 🔗 Docker Registry & Hub

```bash
# Login to Docker Hub
docker login
docker login -u username -p password   # non-interactive (avoid in scripts)

# Login to private registry
docker login myregistry.example.com

# Push to Docker Hub
docker tag myapp:1.0 dockerhubusername/myapp:1.0
docker push dockerhubusername/myapp:1.0

# Pull from Docker Hub
docker pull dockerhubusername/myapp:1.0

# Search Docker Hub
docker search nginx
docker search --filter stars=100 nginx   # filter by stars
docker search --filter is-official=true nginx

# Logout
docker logout
```

---

## 🔁 Docker Layering & Filesystem

```bash
# Each instruction in Dockerfile = one layer
# Layers are CACHED and REUSED

# Visualize layers
docker history nginx --no-trunc

# Inspect filesystem layers
docker inspect nginx --format '{{json .RootFS.Layers}}'

# See layer info with dive (if installed)
# dive nginx

# The writable container layer
docker run -d --name layer-demo nginx
# Changes made in container go to its writable layer
docker exec layer-demo sh -c "echo 'hello' > /tmp/test.txt"
docker diff layer-demo     # see what changed vs image
# C = Changed, A = Added, D = Deleted

docker rm -f layer-demo
```
