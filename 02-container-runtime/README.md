# 02 - Container Runtime, Namespaces & cgroups

## 🔧 Container Runtime

The container runtime is the software responsible for **running containers**.

### Runtime Hierarchy
```
Docker CLI
    ↓
Docker Daemon (dockerd)
    ↓
containerd          ← High-level runtime
    ↓
runc / crun         ← Low-level OCI runtime
    ↓
Linux Kernel (namespaces + cgroups)
```

### Types of Runtimes
| Runtime | Type | Used By |
|---------|------|---------|
| runc | Low-level | Docker, containerd |
| containerd | High-level | Docker, Kubernetes |
| CRI-O | High-level | Kubernetes |
| gVisor (runsc) | Sandboxed | Google Cloud |

---

## 🔒 Process Isolation & Namespaces

Linux **namespaces** provide isolation so each container thinks it has its own system.

### The 7 Linux Namespaces

| Namespace | Flag | Isolates |
|-----------|------|---------|
| PID | CLONE_NEWPID | Process IDs |
| NET | CLONE_NEWNET | Network interfaces, routing |
| MNT | CLONE_NEWNS | Filesystem mount points |
| UTS | CLONE_NEWUTS | Hostname, domain name |
| IPC | CLONE_NEWIPC | Inter-process communication |
| USER | CLONE_NEWUSER | User & group IDs |
| CGROUP | CLONE_NEWCGROUP | cgroup root directory |

### Practical: Exploring Namespaces

```bash
# Run a container and inspect its PID namespace
docker run -d --name ns-demo nginx

# Get container PID on the host
docker inspect ns-demo --format '{{.State.Pid}}'

# View container's namespaces (replace <PID> with actual PID)
ls -la /proc/<PID>/ns/

# Enter container's namespace manually (advanced)
nsenter --target <PID> --mount --uts --ipc --net --pid -- bash

# Compare PID inside vs outside container
# Inside container:
docker exec ns-demo ps aux
# PID 1 = nginx inside container

# Outside container:
ps aux | grep nginx
# Shows higher PID on the host
```

### PID Namespace Demo

```bash
# Container sees PID 1 as its own process
docker run --rm alpine ps aux
# PID   USER     COMMAND
#   1   root     ps aux   ← PID 1 inside container

# Host sees a different PID for the same process
ps aux | grep alpine
```

---

## ⚙️ Control Groups (cgroups) for Resource Limits

**cgroups** (control groups) limit, account for, and isolate the resource usage (CPU, memory, disk I/O, network) of process groups.

### cgroups v1 vs v2
- **cgroups v1**: Separate hierarchies per resource type
- **cgroups v2**: Unified hierarchy (modern Linux, preferred)

### Resource Types Controlled
- CPU (shares, quota, period)
- Memory (limit, swap)
- Block I/O
- Network bandwidth (with tc)
- PIDs (max processes)

---

### Practical: Setting Resource Limits

```bash
# --- MEMORY LIMITS ---

# Limit container to 512MB RAM
docker run -d --name mem-limited --memory="512m" nginx

# Limit memory + swap (total = memory + swap)
docker run -d --memory="512m" --memory-swap="1g" nginx

# Verify the limit
docker inspect mem-limited | grep -i memory

# --- CPU LIMITS ---

# Limit to 0.5 CPUs (50% of one CPU)
docker run -d --cpus="0.5" nginx

# Limit using CPU shares (relative weight, default 1024)
docker run -d --cpu-shares=512 nginx

# Pin to specific CPU cores (core 0 and 1 only)
docker run -d --cpuset-cpus="0,1" nginx

# --- COMBINED LIMITS ---
docker run -d \
  --name resource-limited \
  --memory="256m" \
  --cpus="0.25" \
  --pids-limit=100 \
  nginx

# Inspect resource config
docker inspect resource-limited | grep -A5 "HostConfig"

# --- MONITOR RESOURCE USAGE ---

# Live stats for all containers
docker stats

# Stats for specific container (no stream)
docker stats --no-stream resource-limited

# --- STRESS TEST (requires stress image) ---
docker run --rm --memory="100m" progrium/stress --vm 1 --vm-bytes 150M
# Container will be OOM-killed because it exceeds 100m limit
```

---

## 🔍 Inspecting Runtime Details

```bash
# View cgroup info for a running container
docker run -d --name cgtest --memory="128m" alpine sleep 3600
PID=$(docker inspect cgtest --format '{{.State.Pid}}')

# View cgroup limits on the host
cat /proc/$PID/cgroup
cat /sys/fs/cgroup/memory/docker/$(docker inspect cgtest --format '{{.Id}}')/memory.limit_in_bytes

# View namespace info
cat /proc/$PID/status | grep NSpid

# Clean up
docker rm -f cgtest mem-limited resource-limited
```

---

## 🏗️ Container Images & Layers

```bash
# Pull and inspect image layers
docker pull nginx
docker history nginx

# See layer details
docker inspect nginx | grep -A20 "Layers"

# Image layer sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```
