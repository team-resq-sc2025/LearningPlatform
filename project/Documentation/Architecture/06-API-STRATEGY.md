# 6. API Strategy

**Document ID:** ARCH-006-API | **Status:** 🟢 ACTIVE | **Version:** 1.0.0

---

## 6.1 API Overview

**Goals**:
- Consistent, predictable API design
- Easy to learn and integrate
- Scalable and performant
- Secure by default

---

## 6.2 API Types & Versioning

### **Public APIs** (Partner integrations)
- Version: /v1/, /v2/
- Deprecated: 12-month notice
- Support: N-1 version minimum
- Rate limit: 1,000 req/hour per user

### **Internal APIs** (Service-to-service)
- No external versioning
- Fast iteration allowed
- Contracts via OpenAPI specs
- Rate limit: Unlimited (circuit breaker fallback)

### **Admin APIs** (System management)
- Version: /admin/v1/
- Authentication: Service account + MFA
- Audit: All calls logged
- Rate limit: 100 req/minute

---

## 6.3 REST API Design Standards

### **Endpoints Structure**
```
GET    /courses                 # List all courses
POST   /courses                 # Create course
GET    /courses/{id}            # Get course details
PUT    /courses/{id}            # Update course
DELETE /courses/{id}            # Delete course
PATCH  /courses/{id}            # Partial update

# Nested resources
GET    /courses/{id}/assessments
POST   /courses/{id}/assessments
GET    /courses/{id}/assessments/{aid}
```

### **HTTP Status Codes**
- **2xx**: Success (200, 201, 204)
- **4xx**: Client error (400, 401, 403, 404, 429)
- **5xx**: Server error (500, 502, 503)

### **Error Response Format**
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "User not found",
    "details": {
      "field": "user_id",
      "reason": "UUID not found"
    },
    "trace_id": "abc-def-ghi"
  }
}
```

---

## 6.4 Request/Response Formats

### **Request Validation**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Request-ID: {trace_id}
X-API-Key: {api_key} (for service accounts)
```

### **Response Headers**
```
Content-Type: application/json
X-Request-ID: {trace_id}
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1695900000
Cache-Control: public, max-age=300
```

### **Pagination**
```json
{
  "data": [...],
  "meta": {
    "total": 1000,
    "page": 1,
    "per_page": 25,
    "total_pages": 40
  },
  "links": {
    "self": "/courses?page=1",
    "next": "/courses?page=2",
    "last": "/courses?page=40"
  }
}
```

---

## 6.5 Rate Limiting Strategy

### **Tiers**
| Tier | RPS | Daily | Cost |
|------|-----|-------|------|
| Free | 10 | 1,000 | $0 |
| Pro | 100 | 100K | $99/mo |
| Enterprise | 1,000+ | Unlimited | Custom |

### **Rate Limit Headers**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 743
X-RateLimit-Reset: 1695986400
Retry-After: 60
```

---

## 6.6 Authentication & Authorization

### **Token-Based (JWT)**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Token lifetime: 1 hour
Refresh token: 30 days
```

### **API Key Authentication**
```
X-API-Key: sk_live_abc123def456...
Scope: read, write, admin
Rotation: Every 90 days
```

### **OAuth2 for Third-Parties**
```
POST /oauth/authorize
  ?client_id=app_123
  &redirect_uri=https://app.example.com/callback
  &scope=courses:read,assessments:read
  &response_type=code
```

---

## 6.7 API Documentation

### **OpenAPI (Swagger)**
- Auto-generated from code annotations
- Interactive API explorer (Swagger UI)
- Schema validation
- Example requests/responses

### **Change Log**
```
### [1.2.0] - 2026-09-28

**Added**
- POST /courses/{id}/duplicate endpoint
- X-Duplicate-From header for tracking

**Changed**
- GET /courses response now includes enrollment_count

**Deprecated**
- GET /courses/popular (use GET /courses?sort=popularity)

**Removed**
- DELETE /courses/{id}/archive (use PUT with archived=true)

**Fixed**
- Course title truncation on long names
```

---

## 6.8 Webhooks (Event Notifications)

### **Webhook Events**
```
course.created
course.updated
course.published
assessment.submitted
grading.completed
learner.enrolled
learner.completed
certificate.issued
```

### **Webhook Payload**
```json
{
  "id": "evt_123456",
  "type": "assessment.submitted",
  "timestamp": "2026-09-28T10:30:00Z",
  "data": {
    "assessment_id": "asmt_789",
    "user_id": "user_456",
    "score": 85
  }
}
```

### **Retry Logic**
- Attempt 1: Immediate
- Attempt 2: 5 minutes
- Attempt 3: 30 minutes
- Attempt 4: 2 hours
- Max: 4 attempts (24-hour window)

---

## 6.9 Deprecation & Migration Path

### **Timeline**
1. **Announcement** (Month 1): Notify via email, blog, API docs
2. **Sunset Date** (Months 6-12): Scheduled removal date
3. **Grace Period** (Last month): Still works, heavy logging
4. **Removal**: API endpoint returns 410 Gone

### **Migration Example**
```
# Old endpoint (deprecated in v1.1, removed in v2.0)
GET /learners/{id}/progress

# New endpoint (v2.0)
GET /learners/{id}/learning-progress

# Include deprecation header
Deprecation: true
Sunset: Sun, 31 Dec 2026 23:59:59 GMT
Link: </docs/migration-v1-to-v2>; rel="deprecation"
```

---

## 6.10 API Governance

- **Review**: All new endpoints reviewed by API steering committee
- **Testing**: 100% test coverage required
- **Documentation**: Must be complete before merge
- **Versioning**: Semantic versioning (major.minor.patch)
- **SLA**: 99.99% uptime for public APIs

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Author** | API Platform Team |
| **Version** | 1.0.0 |
| **Review Cycle** | Quarterly |
