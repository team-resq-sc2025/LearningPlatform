# 2. Logical Architecture

**Document ID:** ARCH-002-LOGICAL  
**Status:** 🟢 ACTIVE  
**Last Updated:** 2026-09-28  
**Version:** 1.0.0

---

## 2.1 Overview

Logical architecture describes how the system is organized into logical components and their interactions, independent of physical deployment or technology choices.

---

## 2.2 Logical Component Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│  Web UI  │  Mobile App  │  Admin Portal  │  API Gateway  │  CDN     │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Application Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  LMS          │  Assessment    │  Analytics    │  User              │
│  (Courses)    │  (Grading)     │  (Reports)    │  (Auth, Identity)  │
├──────────────┼────────────────┼───────────────┼────────────────────┤
│  AI/Grading  │  Notification  │  Integration  │  Content           │
│  (ML Models) │  (Email, SMS)  │  (3rd party)  │  (Storage, Index)  │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                                │
├─────────────────────────────────────────────────────────────────────┤
│  Relational  │  Cache    │  Search Index  │  Document Store  │  Queue │
│  Database    │  (Redis)  │  (Elasticsearch)│  (S3/Blob)     │  (Kafka)│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2.3 Core Business Components

### **LMS Service** (Learning Management)
**Responsibilities**:
- Course CRUD operations
- Module and lesson management
- Learner enrollment
- Progress tracking
- Learning path orchestration

**Data Entities**:
- Courses, Modules, Lessons
- Enrollments, Progress
- Learning Paths

**Key Interfaces**:
- REST API: GET/POST /courses, /enrollments
- Events: course.created, enrollment.started
- Internal: ILearningPath, IProgressTracker

---

### **Assessment Service** (Exams & Grading)
**Responsibilities**:
- Question management
- Exam creation and configuration
- Answer submission handling
- Automated grading (MCQ, T/F, Code)
- Manual grading workflow

**Data Entities**:
- Questions, Assessments
- Submissions, Grades
- Rubrics

**Key Interfaces**:
- REST API: POST /assessments, /submissions, /grades
- Events: assessment.submitted, grading.completed
- Internal: IGradingEngine, IRubricEvaluator

---

### **Analytics Service** (Reporting & Insights)
**Responsibilities**:
- Aggregate learner performance data
- Generate reports and dashboards
- Calculate learning metrics
- Predictive analytics
- Anomaly detection

**Data Entities**:
- Aggregated metrics
- Performance KPIs
- Trend analysis

**Key Interfaces**:
- REST API: GET /analytics/dashboard, /reports
- Events: User subscribes to analytics streams
- Internal: IMetricsAggregator, IPredictiveModel

---

### **User Service** (Identity & Access)
**Responsibilities**:
- User authentication (local, SSO, MFA)
- Authorization and RBAC
- User provisioning/deprovisioning
- Profile management
- Session management

**Data Entities**:
- Users, Roles, Permissions
- Organizations, Teams
- Sessions, Tokens

**Key Interfaces**:
- REST API: POST /auth/login, /users, /permissions
- External: OAuth2, SAML, SCIM
- Internal: IAuthProvider, IRBACEngine

---

### **AI/Grading Service** (Intelligent Automation)
**Responsibilities**:
- Content generation (Claude API)
- Essay grading with NLP
- Plagiarism detection
- Learning recommendations
- Success prediction

**Data Entities**:
- Generated content
- Grading results
- ML model metadata

**Key Interfaces**:
- Job Queue: Async grading jobs
- REST API: POST /grade-essay, /generate-content
- Events: grading.completed, content.generated
- Internal: ILLMProvider, IMLModel

---

### **Notification Service** (Communications)
**Responsibilities**:
- Email delivery
- SMS notifications
- In-app messaging
- Push notifications
- Notification scheduling

**Data Entities**:
- Notification templates
- Delivery logs
- User preferences

**Key Interfaces**:
- Event listeners: Multiple event sources
- REST API: POST /notifications
- External: SendGrid, Twilio, Firebase
- Internal: INotificationDispatcher

---

### **Integration Service** (External Systems)
**Responsibilities**:
- OAuth2/SAML authentication
- API gateway for third-party calls
- Data synchronization
- Webhook management
- Error handling & retries

**Data Entities**:
- Integration configurations
- Sync logs
- API credentials

**Key Interfaces**:
- REST API: GET/POST /integrations
- Webhooks: Inbound from external systems
- External: Okta, Stripe, Slack
- Internal: IIntegrationAdapter

---

### **Content Service** (Storage & Indexing)
**Responsibilities**:
- Course material storage
- Full-text search
- Content versioning
- CDN coordination
- Media processing

**Data Entities**:
- Content metadata
- Search indexes
- Version history

**Key Interfaces**:
- REST API: POST /content/upload, GET /search
- Events: content.uploaded, content.indexed
- External: AWS S3, Elasticsearch
- Internal: IContentRepository, ISearchEngine

---

## 2.4 Cross-Cutting Concerns

### **Authentication & Authorization**
- **Pattern**: Token-based (JWT) + Session management
- **Scope**: All services
- **Implementation**: API Gateway + Auth middleware

### **Logging & Monitoring**
- **Pattern**: Structured logging with trace IDs
- **Scope**: All services
- **Implementation**: Centralized log aggregation

### **Error Handling**
- **Pattern**: Standardized error responses
- **Scope**: All APIs
- **Implementation**: Global exception handlers

### **Rate Limiting**
- **Pattern**: Per-user, per-IP rate limits
- **Scope**: Public APIs
- **Implementation**: API Gateway + Redis counters

### **Caching**
- **Pattern**: Cache-aside, write-through
- **Scope**: Data access layer
- **Implementation**: Redis + application logic

---

## 2.5 Data Flow Patterns

### **Synchronous Request-Response**
```
Client → API Gateway → Service → Database → Response
Timeline: < 500ms
Use: User-facing operations (login, GET course)
```

### **Asynchronous Event-Driven**
```
Service → Event Bus → Consumer Services → Database
Timeline: 1-60 seconds
Use: Long-running operations (grading, content generation)
```

### **Real-Time Streaming**
```
Server → WebSocket/SSE → Client → UI Update
Timeline: < 100ms
Use: Live dashboards, notifications
```

---

## 2.6 Integration Points

| From | To | Pattern | Data |
|------|-----|---------|------|
| Client | API Gateway | REST/GraphQL | JSON |
| Services | Event Bus | Async events | JSON events |
| Services | Database | SQL queries | Structured data |
| Services | External APIs | REST/SOAP | JSON/XML |
| Services | Cache | Key-value | Binary/JSON |
| Services | Search | Elasticsearch API | Documents |

---

## 2.7 Service Dependencies

```
LMS Service
  ├─ depends on: User Service, Content Service
  └─ publishes: course.*, enrollment.*

Assessment Service
  ├─ depends on: LMS, User, AI/Grading
  └─ publishes: assessment.*, submission.*

Analytics Service
  ├─ depends on: All services (subscribers)
  └─ publishes: analytics.* (internal only)

User Service
  ├─ depends on: Identity Provider (external)
  └─ publishes: user.*, auth.*

AI/Grading Service
  ├─ depends on: Assessment, Content
  └─ publishes: grading.*, content.*

Notification Service
  ├─ depends on: All services (event listeners)
  └─ publishes: notification.* (via external)

Content Service
  ├─ depends on: Storage, Search
  └─ publishes: content.*

Integration Service
  ├─ depends on: All services
  └─ publishes: external.sync.*
```

---

## 2.8 Layering Principles

### **Presentation Layer**
- No business logic
- Request validation
- Response formatting
- User experience

### **Application Layer**
- Business logic
- Service orchestration
- Transaction management
- API contracts

### **Data Access Layer**
- Persistence operations
- Query optimization
- Caching logic
- Data consistency

### **External Integration Layer**
- Third-party API calls
- Data transformation
- Error handling
- Protocol adaptation

---

## 2.9 Related Documents

- [System Architecture Details](../Functional/02-system-architecture.md)
- [Data Architecture](05-DATA-ARCHITECTURE.md)
- [API Strategy](06-API-STRATEGY.md)
- [Integration Strategy](07-INTEGRATION-STRATEGY.md)

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Author** | Architecture Team |
| **Reviewed By** | CTO, Lead Architects |
| **Approval Date** | 2026-09-28 |
| **Next Review** | 2026-12-28 |
