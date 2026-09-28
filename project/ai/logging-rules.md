# AI Logging Rules Instructions

## Logging Standards

### Log Levels
- **DEBUG**: Development troubleshooting only (not in production)
- **INFO**: Application events (user actions, state changes)
- **WARN**: Degraded functionality (retry, fallback, circuit breaker)
- **ERROR**: Errors requiring action (validation fail, service error)
- **FATAL**: System failure (startup failure, critical error)

### Structured Logging Format

```json
{
  "timestamp": "2026-09-28T10:30:00Z",
  "level": "INFO",
  "service": "assessment-service",
  "trace_id": "abc-def-ghi",
  "user_id": "user_123",
  "org_id": "org_456",
  "action": "submission_graded",
  "duration_ms": 1245,
  "status": "success",
  "metadata": {
    "assessment_id": "asmt_789",
    "score": 85
  }
}
```

### What to Log

#### ✅ DO Log
```typescript
// User actions
logger.info('User enrolled in course', { userId, courseId });

// Operations completed
logger.info('Assessment graded', { submissionId, score, duration });

// Errors occurred
logger.error('Database connection failed', { error, retryAttempt });

// Performance metrics
logger.warn('Slow query detected', { query, duration: 2500 });

// Important state changes
logger.info('Course published', { courseId, authorId });
```

#### ❌ DO NOT Log
```typescript
// ❌ User passwords
logger.info('User logged in', { email, password }); // NO!

// ❌ Credit card numbers
logger.info('Payment', { cardNumber: '1234-5678-9012-3456' }); // NO!

// ❌ PII without redaction
logger.info('User updated', { ssn: '123-45-6789' }); // NO!

// ❌ API keys, secrets
logger.info('Calling external API', { apiKey: 'sk_live_abc' }); // NO!

// ❌ Debug in production
logger.debug('Processing submission', submission); // NO! (production only)
```

### Log with Trace ID

```typescript
// ✅ ALWAYS include trace_id for request correlation
const traceId = req.headers['x-trace-id'] || generateTraceId();
logger.info('Request received', {
  traceId,
  path: req.path,
  method: req.method,
  userId: req.user?.id
});

// This trace_id appears in logs, metrics, and traces
```

### Error Logging

```typescript
// ✅ Log errors with full context
try {
  await processSubmission(submission);
} catch (error) {
  logger.error('Submission processing failed', {
    traceId,
    submissionId: submission.id,
    error: error.message,
    stack: error.stack,
    retryCount: attempt
  });
  throw error;
}
```

### Performance Logging

```typescript
// ✅ Log slow operations
const start = Date.now();
const result = await db.query('SELECT * FROM courses');
const duration = Date.now() - start;

if (duration > 1000) {
  logger.warn('Slow database query', {
    query: 'SELECT * FROM courses',
    duration,
    rowCount: result.length
  });
}
```

## Sensitive Data Redaction

```typescript
// ✅ ALWAYS redact PII
const redact = (value: string) => value.substring(0, 3) + '***';

logger.info('User created', {
  email: redact(user.email),           // 'use***'
  phone: redact(user.phone),           // '+1*'
  socialSecurity: redact(user.ssn)     // '12*'
});
```

## Centralized Logging

```typescript
// All services log to:
// - Elasticsearch (searchable, real-time)
// - S3 (archival, long-term retention)

// Log retention:
// - Hot (Elasticsearch): 90 days
// - Warm (S3): 1-2 years
// - Cold (Glacier): 7 years
```

## Accessing Logs

```bash
# Via Kibana UI (searchable, dashboard)
# Search: service="assessment-service" AND level="ERROR" AND status="failed"

# Via ELK Stack
GET logs/_search?q=trace_id=abc-def-ghi

# Via CLI
awslogs get /aws/lambda/assessment-service ALL
```

## Logger Configuration

```typescript
// ✅ Configure logger in each service
const logger = require('pino')({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty'  // Pretty format for dev
  }
});

logger.info('Service started', {
  service: 'assessment-service',
  version: '1.0.0',
  environment: process.env.NODE_ENV
});
```

## Logging Checklist

- [ ] No hardcoded secrets in logs
- [ ] No PII without redaction
- [ ] Trace ID included in every request
- [ ] Performance metrics logged for slow ops
- [ ] Errors logged with full context
- [ ] User actions logged (for audit)
- [ ] Service startup/shutdown logged
- [ ] Database operations timed and logged
- [ ] External API calls logged
- [ ] Circuit breaker state changes logged

