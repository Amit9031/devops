# How to Push This to GitHub

## Step 1: Create a GitHub Repository

1. Go to https://github.com
2. Click **New repository**
3. Name it: `docker-practicals`
4. Set to **Public** or **Private**
5. Do NOT initialize with README (we already have one)
6. Click **Create repository**

---

## Step 2: Initialize & Push from Your Machine

Open a terminal in the `docker-practicals` folder and run:

```bash
# Initialize git repo
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Docker & Containers practical guide"

# Rename branch to main (GitHub default)
git branch -M main

# Add your GitHub repo as remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/docker-practicals.git

# Push to GitHub
git push -u origin main
```

---

## Step 3: For Future Updates

```bash
# Stage changes
git add .

# Commit with a message
git commit -m "Add: Docker compose examples for microservices"

# Push
git push
```

---

## Git Tips for This Project

```bash
# Check status
git status

# See what changed
git diff

# See commit history
git log --oneline

# Create a branch for new topics
git checkout -b feature/kubernetes-basics

# Push new branch
git push -u origin feature/kubernetes-basics
```

---

## Suggested Commit Message Format

```
Add: <what you added>
Update: <what you changed>
Fix: <what you fixed>
Remove: <what you removed>

Examples:
  git commit -m "Add: Docker networking lab examples"
  git commit -m "Update: Dockerfile best practices section"
  git commit -m "Add: Spring Boot + PostgreSQL compose stack"
```
