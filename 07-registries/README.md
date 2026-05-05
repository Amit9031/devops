# 07 - Image Registries & Distribution

## 🏪 What is a Registry?

A registry is a **server that stores and distributes container images**.

```
Developer → docker push → Registry → docker pull → Server/CI/K8s
```

| Registry | URL | Free Private Repos |
|----------|-----|-------------------|
| Docker Hub | hub.docker.com | Limited |
| GitHub GHCR | ghcr.io | Yes (for public repos) |
| AWS ECR | *.dkr.ecr.*.amazonaws.com | No (paid) |
| GCP Artifact Registry | *.pkg.dev | No (paid) |
| Azure ACR | *.azurecr.io | No (paid) |
| Self-hosted | Custom | Unlimited |

---

## 🐳 Docker Hub

```bash
# === AUTHENTICATION ===
docker login                          # prompts for username/password
docker login -u myusername            # prompts for password only
docker logout                         # log out

# Store credentials securely
# Docker stores creds in ~/.docker/config.json

# === PULL FROM DOCKER HUB ===
docker pull nginx                     # same as nginx:latest
docker pull nginx:1.25               # specific version
docker pull nginx:1.25-alpine        # alpine variant

# Official images (no username prefix)
docker pull ubuntu
docker pull postgres
docker pull redis

# Community images (username/imagename)
docker pull bitnami/nginx

# === PUSH TO DOCKER HUB ===

# Image must be tagged as: username/imagename:tag
docker tag myapp:1.0 myusername/myapp:1.0
docker tag myapp:1.0 myusername/myapp:latest

docker push myusername/myapp:1.0
docker push myusername/myapp:latest

# === SEARCH DOCKER HUB ===
docker search nginx
docker search --filter is-official=true nginx
docker search --filter stars=1000 python
docker search --limit 10 ubuntu

# === DOCKER HUB RATE LIMITS (as of 2024) ===
# Anonymous: 100 pulls / 6 hours
# Free account: 200 pulls / 6 hours
# Paid: Unlimited
```

---

## 🐱 GitHub Container Registry (GHCR)

```bash
# GHCR hosts images alongside your GitHub repos
# Images at: ghcr.io/username/imagename:tag

# === AUTHENTICATE TO GHCR ===

# 1. Create a GitHub Personal Access Token (PAT)
#    Go to GitHub → Settings → Developer Settings → Personal Access Tokens
#    Select scopes: read:packages, write:packages, delete:packages

# 2. Login
echo $GITHUB_TOKEN | docker login ghcr.io -u GITHUB_USERNAME --password-stdin

# === PUSH TO GHCR ===
docker tag myapp:1.0 ghcr.io/myusername/myapp:1.0
docker push ghcr.io/myusername/myapp:1.0

# === PULL FROM GHCR ===
docker pull ghcr.io/myusername/myapp:1.0

# Make package public (via GitHub UI):
# Go to your package → Package settings → Change visibility → Public

# === CI/CD with GHCR (GitHub Actions example) ===
# .github/workflows/docker.yml:
# - name: Login to GHCR
#   uses: docker/login-action@v2
#   with:
#     registry: ghcr.io
#     username: ${{ github.actor }}
#     password: ${{ secrets.GITHUB_TOKEN }}
#
# - name: Build and Push
#   run: |
#     docker build -t ghcr.io/${{ github.repository }}:latest .
#     docker push ghcr.io/${{ github.repository }}:latest
```

---

## 🏠 Private Registry (Self-Hosted)

```bash
# === RUN LOCAL REGISTRY ===
# Docker provides an official "registry" image

# Start local registry on port 5000
docker run -d \
  --name local-registry \
  -p 5000:5000 \
  --restart always \
  registry:2

# === USE LOCAL REGISTRY ===

# Pull an image, tag for local registry, push
docker pull nginx
docker tag nginx localhost:5000/nginx:latest
docker push localhost:5000/nginx:latest

# Pull from local registry
docker pull localhost:5000/nginx:latest

# List images in local registry (via API)
curl http://localhost:5000/v2/_catalog
# {"repositories":["nginx"]}

# List tags for an image
curl http://localhost:5000/v2/nginx/tags/list

# === REGISTRY WITH AUTHENTICATION ===

# Generate htpasswd file
mkdir -p /tmp/auth
docker run --rm \
  --entrypoint htpasswd \
  httpd:2 \
  -Bbn admin secretpassword > /tmp/auth/htpasswd

# Run registry with auth
docker run -d \
  --name secure-registry \
  -p 5000:5000 \
  -v /tmp/auth:/auth \
  -e REGISTRY_AUTH=htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_REALM="Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  registry:2

# Login to private registry
docker login localhost:5000 -u admin -p secretpassword

# === REGISTRY WITH PERSISTENT STORAGE ===
docker run -d \
  --name persistent-registry \
  -p 5000:5000 \
  --restart always \
  -v registry-data:/var/lib/registry \
  registry:2

# === CONFIGURE DOCKER TO TRUST INSECURE REGISTRY ===
# Add to /etc/docker/daemon.json:
# {
#   "insecure-registries": ["localhost:5000", "myregistry.local:5000"]
# }
# Then: sudo systemctl restart docker

# === CLEAN UP REGISTRY ===
docker rm -f local-registry secure-registry persistent-registry
```

---

## 🔑 Authentication & Access Tokens

```bash
# === DOCKER HUB ACCESS TOKENS (safer than passwords) ===
# 1. Go to hub.docker.com → Account Settings → Security → Access Tokens
# 2. Create new token with appropriate permissions
# 3. Use token as password:
docker login -u myusername --password-stdin <<< "my-access-token"

# Or store in environment
export DOCKER_TOKEN="my-access-token"
echo $DOCKER_TOKEN | docker login -u myusername --password-stdin

# === GITHUB PAT FOR GHCR ===
export GITHUB_TOKEN="ghp_..."
echo $GITHUB_TOKEN | docker login ghcr.io -u github_username --password-stdin

# === CONFIG FILE ===
# Credentials stored in ~/.docker/config.json
cat ~/.docker/config.json

# Use a credential helper (more secure than plain text)
# e.g., docker-credential-pass, docker-credential-secretservice

# === CI/CD BEST PRACTICES ===
# - Never hardcode credentials in Dockerfile or code
# - Use CI/CD secrets (GitHub Secrets, GitLab CI Variables)
# - Use short-lived tokens where possible
# - Use read-only tokens for pulls in production
```

---

## 📋 Registry Comparison

```bash
# Docker Hub
docker pull nginx                                   # public image
docker pull myusername/myapp:1.0                   # user image

# GHCR
docker pull ghcr.io/myusername/myapp:1.0

# AWS ECR
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:1.0

# GCP Artifact Registry
docker pull us-docker.pkg.dev/myproject/myrepo/myapp:1.0

# Local registry
docker pull localhost:5000/myapp:1.0
```
