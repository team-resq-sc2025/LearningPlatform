# Quick Start Guide

Get the AI Training Platform running in 5 minutes!

## Option 1: Docker Compose (Easiest)

### Prerequisites
- Docker and Docker Compose installed
- 5GB free disk space
- Ports 4200 and 8000 available

### Steps

```bash
# 1. Clone and navigate
cd <project-directory>

# 2. Start services (builds and starts everything)
docker-compose up -d

# 3. Wait for services to be healthy (30-60 seconds)
docker-compose ps

# 4. Verify setup
curl http://localhost:8000/health
```

### Access the Application

| Component | URL | Notes |
|-----------|-----|-------|
| Frontend | http://localhost:4200 | Main application UI |
| Backend API | http://localhost:8000 | REST API server |
| API Docs | http://localhost:8000/docs | Interactive Swagger documentation |
| Health Check | http://localhost:8000/health | Service health status |

### Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

---

## Option 2: Manual Setup (For Development)

### Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd python/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Initialize database
python -c "from app.database import create_tables, Base; create_tables(Base)"

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Browser will open automatically to http://localhost:4200
```

### Stop Services

```bash
# Backend: Press Ctrl+C in terminal 1
# Frontend: Press Ctrl+C in terminal 2
```

---

## Testing the Setup

### 1. API Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "database_type": "sqlite"
}
```

### 2. Create a Course via API
```bash
curl -X POST http://localhost:8000/api/v1/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Introduction to Python","description":"Learn Python basics"}'
```

### 3. Get Courses List
```bash
curl http://localhost:8000/api/v1/courses
```

### 4. Access Frontend
Open browser to http://localhost:4200 and check:
- Dashboard loads successfully
- Navigation menu visible
- Courses page shows any created courses

---

## Database Switching

### Use PostgreSQL instead of SQLite

```bash
# With Docker Compose
docker-compose --profile postgres up -d

# Manually, update python/backend/.env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ai_training

# Then start backend
python -m uvicorn app.main:app --reload
```

### Use MSSQL

```bash
# Update .env
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_NAME=ai_training

# Start backend
python -m uvicorn app.main:app --reload
```

---

## Common Issues & Solutions

### Issue: Port 4200 already in use

```bash
# Find and kill process on port 4200
# Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :4200
kill -9 <PID>

# Or use different port
ng serve --port 4201
```

### Issue: Port 8000 already in use

```bash
# Use different port
python -m uvicorn app.main:app --reload --port 8001
```

### Issue: "ModuleNotFoundError" when running backend

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "npm: command not found"

```bash
# Install Node.js from https://nodejs.org/
# Then verify installation
node --version
npm --version
```

### Issue: Frontend can't connect to API

```bash
# Check if backend is running
curl http://localhost:8000/health

# Update API URL in frontend if needed
# Edit: frontend/src/app/services/course.service.ts
# Change: private apiUrl = '/api/v1/courses';
# To: private apiUrl = 'http://localhost:8000/api/v1/courses';
```

### Issue: Docker containers not starting

```bash
# Check logs
docker-compose logs

# Common causes:
# 1. Ports already in use - change ports in docker-compose.yml
# 2. Insufficient disk space - free up space
# 3. Docker daemon not running - start Docker Desktop

# Full reset
docker-compose down -v
docker system prune -a
docker-compose up -d
```

---

## Next Steps

1. **Read the README**: See full feature list and architecture
   ```bash
   cat README.md
   ```

2. **Review Documentation**: Understand system design
   ```bash
   ls Documentation/Architecture/
   ```

3. **Check API Docs**: Interactive swagger at http://localhost:8000/docs

4. **Explore Code**: Start in `python/backend/app/main.py` and `frontend/src/app/app.component.ts`

5. **Create Test Data**: Use API endpoints to create courses, users, assessments

6. **Read Contributing Guidelines**: See `/ai/` folder for coding standards

---

## Development Workflow

### Typical Development Loop

```bash
# Terminal 1: Backend
cd python/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend  
cd frontend
npm start

# Terminal 3: Run tests (optional)
cd frontend
npm test
```

### Making Changes

**Backend Changes:**
- Edit files in `python/backend/app/`
- Server auto-reloads with `--reload` flag
- Check API at http://localhost:8000/docs

**Frontend Changes:**
- Edit files in `frontend/src/app/`
- Browser auto-reloads with `npm start`
- Check UI at http://localhost:4200

### Creating Migrations

```bash
# After changing models in python/backend/app/models.py
cd python/backend

# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migration
alembic upgrade head
```

---

## Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Need Help?

1. **Read the docs**: [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Check API docs**: http://localhost:8000/docs
3. **Review architecture**: [Documentation/Architecture/](./Documentation/Architecture/)
4. **Look at examples**: See `/ai/examples.md` for code patterns
5. **Enable debug logging**: Set `DEBUG=True` in `.env`

---

**Now you're ready! Start exploring the application at http://localhost:4200**
