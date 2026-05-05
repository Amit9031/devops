# 08 - Microservices Architecture

## 🏛️ Monolithic vs Microservices

### Monolithic Architecture
```
┌───────────────────────────────────────┐
│           Monolithic App              │
│  ┌─────────┐ ┌──────────┐ ┌───────┐  │
│  │  Auth   │ │ Products │ │ Orders│  │
│  └─────────┘ └──────────┘ └───────┘  │
│  ┌─────────┐ ┌──────────┐ ┌───────┐  │
│  │Payments │ │ Shipping │ │Notifs │  │
│  └─────────┘ └──────────┘ └───────┘  │
│         Single Database               │
└───────────────────────────────────────┘
         Single Deployment Unit
```

### Microservices Architecture
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Auth   │  │ Products │  │  Orders  │
│ Service  │  │ Service  │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
            ┌───────▼────────┐
            │   API Gateway   │
            └───────┬────────┘
                    │
                 Client
```

---

## 📊 Comparison Table

| Aspect | Monolithic | Microservices |
|--------|-----------|---------------|
| Deployment | All-or-nothing | Independent per service |
| Scaling | Scale the whole app | Scale only what's needed |
| Tech stack | Single stack | Polyglot (different per service) |
| Failure | One bug can crash all | Isolated failure |
| Development | Simpler initially | More complex, better long-term |
| Testing | Easier unit tests | Integration testing harder |
| Team size | Small teams | Multiple teams per service |
| DB | Single shared DB | DB per service |

---

## ✅ Need for Microservices

### Pain Points of Monoliths at Scale
- **Slow deployments**: Full app must be rebuilt/redeployed for small change
- **Scaling inefficiency**: Must scale entire app even if only one module is under load
- **Tech lock-in**: Entire app must use same language/framework
- **Long onboarding**: New devs must understand entire codebase
- **Cascading failures**: One module's bug can crash everything

### When to Choose Microservices
- Large, complex applications
- Multiple development teams
- Different scaling requirements per component
- Need for independent deployment cycles

---

## 🚀 Advantages of Microservices

### Scalability
```bash
# Scale only the service that needs it
# Example: Product search gets 10x traffic during sale

# Instead of scaling everything:
docker service scale product-search=10   # only scale this!
docker service scale auth=2              # keep this small
```

### Isolation
```
Auth Service crashes → Orders Service still works
Payment Service has bug → Products Service unaffected
```

### Agility
- Teams deploy independently (no coordination needed)
- A/B testing per service
- Canary deployments per service
- Different teams can use Python, Go, Node, Java etc.

### Technology Freedom
```
auth-service:     Node.js + JWT
product-service:  Python + FastAPI + Redis
order-service:    Java Spring Boot + PostgreSQL
payment-service:  Go + gRPC
notification:     Python + Celery + RabbitMQ
```

---

## 🔀 API Gateway

The API Gateway is the **single entry point** for all client requests.

```
Client Request
     ↓
API Gateway (e.g., Nginx, Kong, Traefik, AWS API Gateway)
     ↓
Routes to appropriate microservice

Responsibilities:
  ✓ Authentication / Authorization
  ✓ Rate limiting
  ✓ Load balancing
  ✓ SSL termination
  ✓ Request/Response transformation
  ✓ Caching
  ✓ Logging
```

### Simple Nginx API Gateway Example

```nginx
# nginx.conf for API Gateway
upstream auth_service {
    server auth:3001;
}
upstream product_service {
    server products:3002;
}
upstream order_service {
    server orders:3003;
}

server {
    listen 80;

    location /api/auth {
        proxy_pass http://auth_service;
    }

    location /api/products {
        proxy_pass http://product_service;
    }

    location /api/orders {
        proxy_pass http://order_service;
    }
}
```

---

## 🐳 Microservices with Docker

```bash
# Each service = its own container
# Services communicate over Docker network

# Create network
docker network create microservices-net

# Start each service
docker run -d \
  --name auth-service \
  --network microservices-net \
  -e DB_URL=postgresql://auth-db/authdb \
  auth-image:1.0

docker run -d \
  --name product-service \
  --network microservices-net \
  -e REDIS_URL=redis://cache:6379 \
  product-image:1.0

docker run -d \
  --name api-gateway \
  --network microservices-net \
  -p 80:80 \
  nginx-gateway:1.0

# Services resolve each other by name:
# auth-service → http://auth-service:3001
# products → http://product-service:3002
```

---

## 📡 Service Communication Patterns

```
Synchronous (REST/gRPC):
  Service A ──HTTP──► Service B
  (waits for response)

Asynchronous (Message Queue):
  Service A ──publish──► Queue ──consume──► Service B
  (doesn't wait, decoupled)

Examples:
  - REST: Most common, simple CRUD operations
  - gRPC: High-performance, internal services
  - RabbitMQ/Kafka: Events, notifications, async tasks
```
