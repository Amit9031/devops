# 🐳 Docker Quick Reference Cheat Sheet

## Images
| Command | Description |
|---------|-------------|
| `docker pull image:tag` | Pull image from registry |
| `docker images` | List local images |
| `docker build -t name:tag .` | Build from Dockerfile |
| `docker tag src:tag dst:tag` | Tag/rename an image |
| `docker push name:tag` | Push to registry |
| `docker rmi image` | Remove image |
| `docker history image` | Show image layers |
| `docker inspect image` | Image metadata |
| `docker image prune -a` | Remove unused images |

## Containers
| Command | Description |
|---------|-------------|
| `docker run -d image` | Run detached |
| `docker run -it image sh` | Interactive shell |
| `docker run -p 8080:80 image` | Port mapping |
| `docker run -v vol:/path image` | Mount volume |
| `docker run -e KEY=val image` | Set env var |
| `docker run --rm image` | Auto-remove on exit |
| `docker ps` | List running containers |
| `docker ps -a` | All containers |
| `docker stop name` | Stop container |
| `docker rm name` | Remove container |
| `docker rm -f name` | Force remove |
| `docker logs -f name` | Follow logs |
| `docker exec -it name sh` | Shell into container |
| `docker cp src name:/dst` | Copy file to container |
| `docker stats` | Live resource stats |
| `docker inspect name` | Container metadata |

## Networks
| Command | Description |
|---------|-------------|
| `docker network ls` | List networks |
| `docker network create net` | Create network |
| `docker network inspect net` | Inspect network |
| `docker network connect net c` | Connect container |
| `docker network disconnect net c` | Disconnect |
| `docker network rm net` | Remove network |

## Volumes
| Command | Description |
|---------|-------------|
| `docker volume ls` | List volumes |
| `docker volume create vol` | Create volume |
| `docker volume inspect vol` | Volume info |
| `docker volume rm vol` | Remove volume |
| `docker volume prune` | Remove unused |

## Docker Compose
| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services |
| `docker compose down` | Stop & remove containers |
| `docker compose down -v` | Stop + remove volumes |
| `docker compose ps` | Service status |
| `docker compose logs -f` | Follow all logs |
| `docker compose exec svc sh` | Shell into service |
| `docker compose build` | Build images |
| `docker compose pull` | Pull images |
| `docker compose restart` | Restart services |

## System
| Command | Description |
|---------|-------------|
| `docker info` | System info |
| `docker system df` | Disk usage |
| `docker system prune -a` | Clean unused resources |
| `docker login` | Login to Docker Hub |
| `docker logout` | Logout |
| `docker version` | Client/daemon version |

---

## Run Flags Reference
```
-d              Detached (background)
-it             Interactive + TTY
-p 8080:80      Port: host:container
-P              Auto-assign host ports
-v vol:/path    Volume mount
-v /host:/cont  Bind mount
-e KEY=val      Environment variable
--env-file .env Load env from file
--name myapp    Container name
--rm            Remove on stop
--network net   Custom network
--restart       unless-stopped|always|on-failure
--memory 512m   Memory limit
--cpus 0.5      CPU limit
-w /app         Working directory
--user 1000     Run as user
```

## Dockerfile Quick Reference
```dockerfile
FROM base:tag          # Base image
LABEL key=value        # Metadata
ARG VAR=default        # Build argument
ENV VAR=value          # Environment variable
WORKDIR /path          # Working directory
COPY src dst           # Copy files
ADD src dst            # Copy + untar/URL
RUN command            # Execute command (creates layer)
EXPOSE port            # Document port
VOLUME /path           # Mount point
USER username          # Switch user
CMD ["cmd", "arg"]     # Default command
ENTRYPOINT ["cmd"]     # Always-run command
HEALTHCHECK CMD ...    # Health test
```
