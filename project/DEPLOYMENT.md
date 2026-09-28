# Deployment Guide

## Overview

The AI Training & Assessment Platform supports multiple deployment scenarios:
1. **Local Development** - Using Docker Compose with SQLite
2. **Staging** - Using Docker Compose with PostgreSQL
3. **Production** - Kubernetes or Docker Swarm with enterprise databases

## Prerequisites

- Docker and Docker Compose 2.0+
- For Kubernetes: kubectl and cluster access
- For production: SSL/TLS certificates

## Local Development Setup

### 1. Using Docker Compose with SQLite

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Access:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8000
- API Swagger Docs: http://localhost:8000/docs

### 2. Manual Local Setup

#### Backend
```bash
cd python/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Initialize database
python app/database.py

# Run server
python -m uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

## Staging Deployment

### Using Docker Compose with PostgreSQL

```bash
# Create .env file with PostgreSQL settings
cat > .env << EOF
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=stg_password_123
DB_NAME=ai_training_stg
EOF

# Start services with postgres profile
docker-compose --profile postgres up -d

# Verify PostgreSQL is healthy
docker-compose exec postgres psql -U postgres -d ai_training_stg -c "SELECT 1;"

# Run migrations
docker-compose exec backend alembic upgrade head
```

### Environment Configuration

```env
# Backend
DEBUG=False
LOG_LEVEL=INFO
API_CORS_ORIGINS=["http://staging.example.com"]

# Database
DB_TYPE=postgres
DB_HOST=postgres-stg.example.com
DB_PORT=5432
DB_USER=stg_user
DB_PASSWORD=${SECURE_PASSWORD}
DB_NAME=ai_training_stg

# Security
JWT_SECRET_KEY=${SECURE_JWT_KEY}
```

## Production Deployment

### 1. Using Docker (Single VM)

```bash
# Build images
docker-compose -f docker-compose.yml build

# Create overlay network for cross-host communication
docker network create --driver overlay app-network

# Deploy backend
docker run -d \
  --name ai-backend \
  --network app-network \
  -e DB_TYPE=postgres \
  -e DB_HOST=prod-db.example.com \
  -e DB_PORT=5432 \
  -e DB_USER=prod_user \
  -e DB_PASSWORD=${DB_PASSWORD} \
  -e JWT_SECRET_KEY=${JWT_SECRET} \
  -p 8000:8000 \
  ai-training-platform:backend

# Deploy frontend
docker run -d \
  --name ai-frontend \
  --network app-network \
  -p 80:80 \
  -p 443:443 \
  ai-training-platform:frontend
```

### 2. Using Docker Compose (Production-Ready)

```yaml
version: '3.9'

services:
  backend:
    image: ai-training-platform:backend-latest
    container_name: ai-backend-prod
    restart: always
    networks:
      - app-network
    environment:
      DB_TYPE: postgres
      DB_HOST: ${DB_HOST}
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ai_training_prod
      DEBUG: 'False'
      LOG_LEVEL: WARNING
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    image: ai-training-platform:frontend-latest
    container_name: ai-frontend-prod
    restart: always
    networks:
      - app-network
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/nginx/certs:ro
    depends_on:
      - backend
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:
    driver: bridge
```

### 3. Kubernetes Deployment

#### Create Namespace
```bash
kubectl create namespace ai-training
```

#### Backend Deployment (backend-deployment.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-backend
  namespace: ai-training
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-backend
  template:
    metadata:
      labels:
        app: ai-backend
    spec:
      containers:
      - name: backend
        image: ai-training-platform:backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
        env:
        - name: DB_TYPE
          value: "postgres"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        - name: DB_PORT
          value: "5432"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: user
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        - name: DB_NAME
          value: "ai_training_prod"
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: ai-backend-service
  namespace: ai-training
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
  selector:
    app: ai-backend
```

#### Frontend Deployment (frontend-deployment.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-frontend
  namespace: ai-training
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-frontend
  template:
    metadata:
      labels:
        app: ai-frontend
    spec:
      containers:
      - name: frontend
        image: ai-training-platform:frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: ai-frontend-service
  namespace: ai-training
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
  selector:
    app: ai-frontend
```

#### Deploy to Kubernetes
```bash
# Create secrets
kubectl create secret generic db-secret \
  --from-literal=host=prod-db.example.com \
  --from-literal=user=prod_user \
  --from-literal=password=${DB_PASSWORD} \
  -n ai-training

kubectl create secret generic jwt-secret \
  --from-literal=secret=${JWT_SECRET_KEY} \
  -n ai-training

# Deploy
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Check deployment status
kubectl get deployments -n ai-training
kubectl get pods -n ai-training
kubectl get svc -n ai-training
```

## Database Migration in Production

### Pre-deployment Backup
```bash
# PostgreSQL backup
pg_dump -h prod-db.example.com -U prod_user ai_training_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# MSSQL backup
sqlcmd -S prod-db.example.com -U sa -Q "BACKUP DATABASE ai_training_prod TO DISK='backup.bak'"
```

### Run Migrations
```bash
# Docker
docker-compose exec backend alembic upgrade head

# Kubernetes
kubectl exec -it <backend-pod-name> -n ai-training -- alembic upgrade head

# Manual Python
python -m alembic upgrade head
```

### Verify Migrations
```bash
# Check current revision
alembic current

# View migration history
alembic history
```

## Health Checks & Monitoring

### Backend Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "database_type": "postgres"
}
```

### Database Connection Check
```bash
curl http://localhost:8000/api/v1/database
```

### Container Logs
```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes
kubectl logs -f deployment/ai-backend -n ai-training
kubectl logs -f deployment/ai-frontend -n ai-training
```

## Scaling Guidelines

### Horizontal Scaling
- **Backend**: Stateless, can scale to any number of replicas
- **Frontend**: Stateless, can scale to any number of replicas
- **Database**: Use connection pooling (configured in app/database.py)

### Vertical Scaling
```yaml
resources:
  requests:
    memory: "1Gi"      # Increase for heavy workloads
    cpu: "1000m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

### Database Tuning
- Configure connection pool size in `.env`
- Enable caching layer (Redis)
- Use read replicas for reporting queries
- Implement query optimization and indexing

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Verify database connection
curl http://localhost:8000/api/v1/database

# Check environment variables
docker-compose exec backend printenv | grep DB_
```

### Frontend Can't Connect to Backend
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check CORS settings in backend
# Edit: python/backend/app/main.py
# app.add_middleware(CORSMiddleware, allow_origins=[...])

# Check nginx proxy configuration
docker-compose exec frontend cat /etc/nginx/nginx.conf
```

### Database Connection Issues
```bash
# Test database connection
docker-compose exec backend python -c "from app.database import check_database_connection; print(check_database_connection())"

# For PostgreSQL
docker-compose exec postgres psql -U postgres -l

# For MSSQL
docker-compose exec mssql sqlcmd -S localhost -U sa -Q "SELECT @@VERSION"
```

## Rollback Procedure

### Database Rollback
```bash
# Get previous migration revision
alembic history

# Downgrade to previous version
alembic downgrade -1

# Or downgrade to specific revision
alembic downgrade <revision_id>
```

### Container Rollback
```bash
# Docker: pull previous tag
docker pull ai-training-platform:backend:v1.0.0
docker pull ai-training-platform:frontend:v1.0.0

# Update docker-compose.yml with old image tags
# Then restart
docker-compose up -d
```

### Kubernetes Rollback
```bash
# View rollout history
kubectl rollout history deployment/ai-backend -n ai-training

# Rollback to previous revision
kubectl rollout undo deployment/ai-backend -n ai-training

# Rollback to specific revision
kubectl rollout undo deployment/ai-backend -n ai-training --to-revision=2
```

## Security Checklist

- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL for all traffic
- [ ] Configure firewall rules to restrict access
- [ ] Enable logging and monitoring
- [ ] Rotate JWT secrets regularly
- [ ] Implement rate limiting
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for secrets (never commit .env)
- [ ] Enable database encryption at rest
- [ ] Implement backup and disaster recovery procedures
- [ ] Regular security audits and penetration testing

## Performance Optimization

1. **Caching**: Implement Redis for session and query caching
2. **CDN**: Serve static frontend assets from CDN
3. **Database**: Add appropriate indexes on frequently queried columns
4. **Compression**: Enable gzip compression in nginx
5. **Monitoring**: Use Prometheus and Grafana for metrics

## Support

For deployment issues:
1. Check logs in `/logs` directory
2. Review this guide and linked documentation
3. Consult with DevOps team
4. Open issue in project repository
