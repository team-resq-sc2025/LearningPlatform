# AI API Rules Instructions

## REST API Design Standards

### Endpoint Naming
```
GET    /v1/courses                 # List
POST   /v1/courses                 # Create
GET    /v1/courses/{id}            # Get single
PUT    /v1/courses/{id}            # Replace
PATCH  /v1/courses/{id}            # Partial update
DELETE /v1/courses/{id}            # Delete

# Nested resources
GET    /v1/courses/{courseId}/assessments
POST   /v1/courses/{courseId}/assessments
GET    /v1/courses/{courseId}/assessments/{assessmentId}
```

### Request/Response Format
```json
// Request
{
  "title": "Python Basics",
  "description": "Learn Python fundamentals",
  "level": "beginner"
}

// Success Response (201)
{
  "data": {
    "id": "course_123",
    "title": "Python Basics",
    "created_at": "2026-09-28T10:30:00Z"
  }
}

// Error Response (4xx/5xx)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": { "field": "title" },
    "trace_id": "abc-def-ghi"
  }
}
```

### HTTP Status Codes
- **200**: OK (GET, successful response)
- **201**: Created (POST successfully created)
- **204**: No Content (DELETE, successful)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing auth)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource missing)
- **409**: Conflict (duplicate, state conflict)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error
- **502/503**: Service Unavailable

### Request Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Request-ID: {trace_id}
X-API-Key: {api_key} (service-to-service)
```

### Response Headers
```
X-Request-ID: {trace_id}
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1695900000
Cache-Control: public, max-age=300
```

## Pagination

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
    "self": "/v1/courses?page=1",
    "next": "/v1/courses?page=2",
    "last": "/v1/courses?page=40"
  }
}
```

## Filtering, Sorting, Searching

```
GET /v1/courses?status=published&level=beginner
GET /v1/courses?sort=-created_at  # - for descending
GET /v1/courses?search=python      # Full-text search
GET /v1/courses?page=2&per_page=50 # Pagination
```

## API Versioning

- **URL Path**: `/v1/`, `/v2/` (never `/api/v1/`)
- **Support**: N and N-1 versions (v2 + v1)
- **Deprecation**: 12-month notice
- **Headers**: Include version in response headers

## Authentication

```typescript
// ✅ ALL endpoints protected except public ones
app.get('/v1/courses', authenticateUser(), (req, res) => {
  res.json(courses);
});

// Public endpoint (rare)
app.post('/v1/auth/register', (req, res) => { ... });
```

## Authorization

```typescript
// ✅ Check permissions at service layer
app.put('/v1/courses/:id',
  authenticateUser(),
  authorizeCourse('write'),
  (req, res) => {
    updateCourse(req.params.id, req.body);
  }
);
```

## Multi-Tenancy in APIs

```typescript
// ✅ ALWAYS filter by org_id
const getCourses = (userId: string) => {
  const orgId = getOrgIdFromUser(userId);
  return db.query('SELECT * FROM courses WHERE org_id = $1', [orgId]);
};
```

## API Documentation

```typescript
/**
 * Get a specific course
 * 
 * @route GET /v1/courses/:id
 * @param {string} id - Course ID
 * @returns {Object} Course object
 * @throws {NotFoundException} Course not found
 */
export const getCourse = async (id: string) => { ... };
```

## Rate Limiting

```
Free tier: 100 req/minute
Pro tier: 1000 req/minute
Enterprise: 10,000 req/minute

Public endpoints: Lower limits
Authenticated: Higher limits
```

## Caching

```
Cache-Control: public, max-age=300          # 5 min cache
Cache-Control: private, max-age=60          # 1 min, user-specific
Cache-Control: no-cache                     # Always validate
Cache-Control: no-store                     # Never cache (sensitive)
```

## Webhooks

```
POST {customer_url}/webhooks/assessment.submitted
Content-Type: application/json
X-Webhook-Signature: HMAC-SHA256(payload, secret)

{
  "id": "evt_123",
  "type": "assessment.submitted",
  "timestamp": "2026-09-28T10:30:00Z",
  "data": { ... }
}
```

## CORS (if needed)

```typescript
// ✅ Restrict to known origins
app.use(cors({
  origin: ['https://app.example.com', 'https://admin.example.com'],
  credentials: true
}));
```

## HATEOAS (Optional)

```json
{
  "id": "course_123",
  "title": "Python Basics",
  "_links": {
    "self": { "href": "/v1/courses/course_123" },
    "update": { "href": "/v1/courses/course_123", "method": "PUT" },
    "delete": { "href": "/v1/courses/course_123", "method": "DELETE" }
  }
}
```

## API Checklist

Before shipping an API:
- [ ] All endpoints documented
- [ ] Error responses include trace_id
- [ ] Rate limiting configured
- [ ] Authentication enforced
- [ ] Authorization checked (RBAC)
- [ ] Multi-tenancy isolation verified
- [ ] Pagination working
- [ ] Sorting working
- [ ] Filtering working
- [ ] No sensitive data in responses
- [ ] Proper HTTP status codes
- [ ] Tests for happy path + error cases

