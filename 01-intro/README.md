# 01 - Introduction to Containers

## 📜 Origin of Containers

### Timeline
| Year | Milestone |
|------|-----------|
| 1979 | Unix `chroot` — first process isolation |
| 2000 | FreeBSD Jails — OS-level virtualization |
| 2004 | Solaris Zones |
| 2006 | Google introduces `cgroups` (control groups) |
| 2008 | Linux Containers (LXC) released |
| 2013 | **Docker** launched — made containers mainstream |
| 2014 | Kubernetes released by Google |
| 2015 | OCI (Open Container Initiative) formed |
| 2016 | Containerd, rkt, other runtimes emerge |

---

## 🚢 What is a Container?

A container is a **lightweight, portable, isolated** unit that packages an application with all its dependencies (libraries, config, runtime) so it runs consistently across any environment.

```
+-----------------------------+
|        Application          |
|   (code + libs + config)    |
+-----------------------------+
|       Container Engine      |  ← Docker / containerd
+-----------------------------+
|         Host OS Kernel      |  ← Shared!
+-----------------------------+
|           Hardware          |
+-----------------------------+
```

### Container vs Virtual Machine

| Feature | Container | Virtual Machine |
|---------|-----------|-----------------|
| Boot time | Seconds | Minutes |
| Size | MBs | GBs |
| OS | Shares host kernel | Full guest OS |
| Isolation | Process-level | Hardware-level |
| Portability | High | Medium |
| Performance | Near-native | Overhead |

---

## 🏗️ Emergence of Modern Containerization

### The Problem Before Docker
- "Works on my machine" syndrome
- Dependency conflicts between apps
- Heavy VMs for simple apps
- Complex deployment pipelines

### Docker's Solution (2013)
- Simple CLI to build, ship, run containers
- Layered image filesystem (copy-on-write)
- Docker Hub for image sharing
- Dockerfile for reproducible builds

---

## 🔄 Integration into DevOps

```
Developer → Git Push → CI Pipeline → Docker Build → Registry → Deploy
                                         ↓
                                   docker build .
                                   docker push
                                         ↓
                                   docker pull
                                   docker run / k8s deploy
```

### DevOps Benefits
- **CI/CD**: Build once, run anywhere
- **Microservices**: Each service in its own container
- **Scalability**: Spin up/down containers in seconds
- **Consistency**: Dev, staging, prod use same image

---

## 🧪 Practical Commands

```bash
# Verify Docker installation
docker --version
docker info

# Your first container
docker run hello-world

# Run Ubuntu interactively
docker run -it ubuntu bash

# Inside the container
cat /etc/os-release
ls /
exit

# Run in background (detached)
docker run -d nginx

# See running containers
docker ps

# See ALL containers (including stopped)
docker ps -a
```
