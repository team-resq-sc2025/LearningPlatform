# AI-Powered Training & Assessment Platform

A full-stack application for training delivery, assessment management, and AI-powered grading. Built with **FastAPI** (backend), **Angular** (frontend), and containerized with **Docker**.

## Features

- **Multi-tenant Architecture**: Isolated data per organization
- **Flexible Database Support**: SQLite (default), PostgreSQL, MSSQL, Oracle
- **Course Management**: Create courses, modules, and lessons
- **Assessment Engine**: Quizzes, exams, and assignments
- **User Management**: Role-based access (admin, instructor, learner)
- **Enrollment Tracking**: Monitor user progress and completion
- **Certificate Issuance**: Award certificates upon course completion
- **Responsive UI**: Modern Angular frontend with PrimeNG components
- **Docker Deployment**: Multi-container setup with docker-compose

## Architecture

```
┌─────────────┐
│   Angular   │
│  Frontend   │
│  (Port 4200)│
└──────┬──────┘
       │
       ├─────API Calls─────┐
       │                   ▼
       │         ┌──────────────────┐
       │         │   FastAPI        │
       │         │  Backend         │
       │         │  (Port 8000)     │
       │         └────────┬─────────┘
       │                  │
       └──────────────────┤
                          ▼
               ┌──────────────────────┐
               │  Database Layer      │
               │  (SQLite/Postgres)   │
               └──────────────────────┘
```

## Project Structure

```
.
├── python/
│   └── backend/
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py          # FastAPI application entry point
│       │   ├── config.py        # Configuration management
│       │   ├── database.py      # Database setup
│       │   └── models.py        # SQLAlchemy ORM models
│       ├── alembic/             # Database migrations
│       │   └── versions/
│       │       └── 001_initial_schema.py
│       ├── Dockerfile           # Container image definition
│       ├── requirements.txt     # Python dependencies
│       ├── .env.example         # Environment template
│       └── docker-compose.yml   # Multi-container orchestration
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Angular components
│   │   │   ├── services/        # HTTP services
│   │   │   ├── models/          # TypeScript interfaces
│   │   │   └── app.component.ts # Root component
│   │   ├── styles.css           # Global styles
│   │   └── index.html
│   ├── Dockerfile               # Nginx + Angular build
│   ├── nginx.conf              # Web server configuration
│   ├── package.json            # Node dependencies
│   └── angular.json            # Angular CLI config
├── Documentation/               # Architecture documentation
│   └── Architecture/
│       ├── ADR/                # Architecture Decision Records
│       └── *.md                # Design documents
└── ai/                         # AI instruction files
    └── *.md
```

## Prerequisites

- **Docker** and **Docker Compose** (recommended)
- Or manually:
  - **Python 3.11+** with pip
  - **Node.js 20+** with npm

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd python/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database (copy .env.example to .env)
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build:prod
```

## Configuration

### Database Selection

The application supports multiple database engines. Set via `DB_TYPE` environment variable:

#### SQLite (Default)
```env
DB_TYPE=sqlite
DB_SQLITE_PATH=./app.db
```

#### PostgreSQL
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=ai_training
```

#### MSSQL
```env
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_NAME=ai_training
```

#### Oracle
```env
DB_TYPE=oracle
DB_HOST=localhost
DB_PORT=1521
DB_USER=system
DB_PASSWORD=password
DB_NAME=ORCL
```

### Environment Variables

See `.env.example` for all available configuration options:
- `DB_TYPE`: Database type (sqlite, postgres, mssql, oracle)
- `API_HOST`: Backend API host (default: 0.0.0.0)
- `API_PORT`: Backend API port (default: 8000)
- `DEBUG`: Debug mode (default: False)
- `API_CORS_ORIGINS`: CORS allowed origins (default: ["*"])

## API Endpoints

### Health & System
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/v1/database` - Database information

### Courses
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/{id}` - Get course details

### Users
- `GET /api/v1/users` - List users
- `GET /api/v1/organizations` - List organizations

### Assessments
- `GET /api/v1/assessments` - List assessments

## Database Models

The application includes the following core models:

- **Organization**: Multi-tenant root entity
- **User**: Platform users with role-based access
- **Course**: Learning content containers
- **Module**: Course sections
- **Lesson**: Module units
- **Enrollment**: User-course relationships
- **Assessment**: Quizzes, exams, assignments
- **Question**: Assessment items
- **Submission**: User assessment responses
- **Certificate**: Completion badges

## Testing

### Backend
```bash
cd python/backend
pytest tests/ --cov=app
```

### Frontend
```bash
cd frontend
npm test
ng test
```

## Deployment

### Docker Compose (Local/Development)
```bash
docker-compose up -d
```

### Production with PostgreSQL
```bash
docker-compose --profile postgres up -d
```

### Production with MSSQL
```bash
docker-compose --profile mssql up -d
```

## Documentation

- **Architecture**: See `/Documentation/Architecture/` for detailed system design
- **ADRs**: Review `/Documentation/Architecture/ADR/` for architectural decisions
- **AI Guidelines**: See `/ai/` folder for development standards and coding rules

## Contributing

Follow the guidelines in `/ai/` folder:
- Adhere to coding standards in `/ai/coding-standards.md`
- Follow security rules in `/ai/security-rules.md`
- Write tests following `/ai/testing-rules.md`
- Follow API design in `/ai/api-rules.md`

## Support

For issues or questions:
1. Check existing documentation in `/Documentation/`
2. Review Architecture Decision Records in `/Documentation/Architecture/ADR/`
3. Consult AI instruction files in `/ai/`

## License

Proprietary - All Rights Reserved

## Version

**1.0.0** - Initial release

---

**Built with:** FastAPI, Angular, SQLAlchemy, Docker
**Database Support:** SQLite, PostgreSQL, MSSQL, Oracle
**Last Updated:** 2024
