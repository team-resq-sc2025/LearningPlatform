# ADR-004: API Versioning Strategy (URL Path)

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28

---

## Context

Multiple client types (web, mobile, partners) with different upgrade cycles. Need to deprecate endpoints gracefully without breaking clients. Semantic versioning provides clear upgrade path.

---

## Decision

**URL Path Versioning with N-1 Support:**

```
GET /v1/courses         # Latest stable
GET /v2/courses         # New features
GET /v3/courses         # Future

Support: N and N-1 versions (v2 + v1 active)
Deprecation: 12-month notice before removal
```

### Versioning Rules
- **Major** (v1→v2): Breaking changes require new version
- **Minor** (v1.1): Additive changes, backward compatible
- **Patch** (v1.0.1): Bug fixes, internal changes

### Deprecation Path
```
Month 0: Announce deprecation in headers
         Deprecation: true
         Sunset: Sun, 31 Dec 2026 23:59:59 GMT
         
Months 1-11: Support old version, log usage
             Alert clients via email, docs

Month 12: Remove endpoint (return 410 Gone)
          Support only new version
```

### Response Headers
```
API-Version: 2.0
Deprecation: false
Sunset: null (not deprecated)

--- if deprecated ---
Deprecation: true
Sunset: Sun, 31 Dec 2026 23:59:59 GMT
Link: </docs/migration-v1-to-v2>; rel="deprecation"
```

---

## Rationale

**Why URL Path?**
- **Clarity**: Version obvious from URL
- **Caching**: Different URLs → different cache entries
- **Discovery**: Easy to find documentation
- **Testing**: Multiple versions in single test run

**Why N-1 Support?**
- **Stability**: Partners have time to migrate
- **Predictability**: Clear support timeline
- **Cost**: Don't support old forever, but give time

**Why 12-month Sunset?**
- **Industry Standard**: AWS, Google, Microsoft standard
- **Enterprise Ready**: Large orgs need time to test
- **Reduces Support**: Don't support multiple old versions long-term

---

## Consequences

### Positive
✅ Clear upgrade path  
✅ Multiple versions testable  
✅ Clients control upgrade timing  
✅ Graceful deprecation  

### Negative
❌ Maintain multiple codebases  
❌ Testing complexity  
❌ Routing overhead  

### Mitigations
- **Code Sharing**: Common logic in shared libraries
- **Adapter Pattern**: Old version wraps new version
- **Automated Tests**: Test all supported versions
- **Clear Docs**: Migration guides for each version

---

## Alternatives

### 1. Header-based Versioning
```
Accept: application/json; version=2
Pros: Clean URLs
Cons: Not visible in browser, confusing
Rejected: URL visibility preferred
```

### 2. Subdomains
```
v1.api.platform.com vs v2.api.platform.com
Pros: Separate infrastructure
Cons: SSL certificates, routing complex
Rejected: Overhead not justified
```

### 3. Query Parameter
```
GET /courses?version=2
Pros: Clean code
Cons: Not standard, caching issues
Rejected: Less discoverable
```

---

## Implementation

### Spring Boot Example
```java
@RestController
@RequestMapping("/v1/courses")
public class CoursesV1Controller { ... }

@RestController
@RequestMapping("/v2/courses")
public class CoursesV2Controller { ... }
```

### OpenAPI Schema
```yaml
openapi: 3.0.0
info:
  title: API
  version: 2.0.0
  deprecated: false

paths:
  /v1/courses:  # Old version
    deprecated: true
  /v2/courses:  # Current version
    deprecated: false
```

---

## Related ADRs
- ADR-006: Logging & Telemetry (log API version)

---

## Approval
- **Approved By**: Product, API Team | **Review Date**: 2027-03-28

