# ADR-007: Error Handling Strategy

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28

---

## Decision

**Standardized error handling across services:**

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User not found",
    "details": {
      "field": "user_id",
      "reason": "UUID does not exist"
    },
    "trace_id": "abc-def-ghi"
  }
}
```

### HTTP Status Codes
- **2xx**: Success (200, 201, 204)
- **4xx**: Client error (400, 401, 403, 404, 409, 429)
- **5xx**: Server error (500, 502, 503)

### Error Categories

| Code | Meaning | Action |
|------|---------|--------|
| VALIDATION_ERROR | Input invalid | Retry after fix |
| AUTHENTICATION_FAILED | Invalid credentials | Re-authenticate |
| AUTHORIZATION_FAILED | Insufficient permissions | Escalate to admin |
| NOT_FOUND | Resource missing | Check URL/ID |
| CONFLICT | State conflict | Retry after brief wait |
| RATE_LIMITED | Too many requests | Back off and retry |
| SERVICE_UNAVAILABLE | Dependency down | Retry with backoff |
| INTERNAL_ERROR | Unexpected error | Log incident, support team |

### Retry Strategy
```
Transient Errors (retry): 408, 429, 500, 502, 503, 504
Permanent Errors (no retry): 400, 401, 403, 404

Retry Logic:
  Max Attempts: 3
  Backoff: Exponential (1s, 5s, 30s)
  Jitter: Random ±10% to prevent thundering herd
```

### Circuit Breaker Pattern
```
Normal → Monitor failures
  ↓ If failures > 50% over 5 min
Degraded → Reject new requests
  ↓ After 5 min, allow test request
Half-Open → If succeeds, close circuit
  ↓ If fails, stay open
Failed → Retry later
```

---

## Rationale

**Why Structured Errors?**
- Machine-readable error codes
- Easy for clients to handle
- Trace ID for debugging
- Details for developers

**Why Circuit Breaker?**
- Prevent cascade failures
- Faster failure detection
- Automatic recovery
- Reduced load on failing services

**Why Exponential Backoff?**
- Respect service recovery time
- Distribute retry load
- Industry standard

---

## Consequences

### Positive
✅ Consistent error handling  
✅ Prevents cascade failures  
✅ Easier debugging with trace IDs  
✅ Client-friendly error codes  

### Negative
❌ More code (error handling boilerplate)  
❌ Testing complexity  

---

## Implementation

### Spring Boot
```java
@ExceptionHandler(ValidationException.class)
public ResponseEntity<ErrorResponse> handle(ValidationException e) {
    return ResponseEntity.badRequest().body(
        new ErrorResponse(
            "VALIDATION_ERROR",
            e.getMessage(),
            e.getDetails(),
            RequestContext.getTraceId()
        )
    );
}
```

### Retry with Backoff
```python
import time
import random

def retry_with_backoff(func, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            return func()
        except TransientError as e:
            if attempt == max_attempts - 1:
                raise
            wait_time = (2 ** attempt) + random.uniform(0, 0.1 * (2 ** attempt))
            time.sleep(wait_time)
```

---

## Related ADRs
- ADR-001: Application Architecture (error consistency)
- ADR-006: Logging & Telemetry (error logging)

---

## Approval
- **Approved By**: CTO, API Team | **Review Date**: 2027-03-28

