# ADR-009: Testing Strategy (Test Pyramid)

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28

---

## Decision

**Test Pyramid: 70% Unit / 20% Integration / 10% E2E**

### Unit Tests (70%)
- **Scope**: Single function/class
- **Mocks**: All external dependencies (DB, APIs, services)
- **Speed**: < 100ms per test
- **Coverage**: 80-95% by service
- **Tools**: Jest (Node), pytest (Python), JUnit (Java)
- **Run**: Every commit (pre-commit hook)

### Integration Tests (20%)
- **Scope**: Service + database, service + cache
- **Setup**: Testcontainers for isolated DB/Redis/Kafka
- **Speed**: 100ms - 5 seconds per test
- **Coverage**: 50-70% critical paths
- **Tools**: Pytest, Mocha, Testcontainers
- **Run**: Pull request, before merge

### E2E Tests (10%)
- **Scope**: Full user journeys (login → enroll → submit)
- **Setup**: Real app in staging environment
- **Speed**: 5-60 seconds per test
- **Coverage**: Critical paths only
- **Tools**: Playwright, Selenium, Cypress
- **Run**: After merge, nightly

### Performance Tests
- **Scope**: Load, stress, latency
- **Tools**: K6, JMeter, Locust
- **Target**: Baseline 1000 RPS, spike 5000 RPS
- **Run**: Weekly, pre-release

---

## Testing Quality Gates

| Level | Required | Gate |
|-------|----------|------|
| Unit | 80%+ coverage | Block merge if below |
| Integration | All critical paths | Run before merge |
| E2E | 5+ critical journeys | Nightly validation |
| Performance | < 500ms p95 latency | Pre-release check |

---

## Rationale

**Why Test Pyramid?**
- **Unit**: Fast feedback (seconds)
- **Integration**: Realistic but isolated
- **E2E**: Full user validation
- **Balance**: Most bugs caught by unit tests

**Why These Tools?**
- Jest/pytest: Industry standard, great DX
- Testcontainers: Docker-based isolation
- Playwright: Modern, reliable E2E
- K6: Developer-friendly load testing

---

## Consequences

### Positive
✅ Fast feedback loops  
✅ High confidence in changes  
✅ Parallelizable test execution  
✅ Maintainable (most tests are simple units)  

### Negative
❌ Requires discipline (write tests)  
❌ Testing infrastructure to maintain  
❌ Mock complexity (mocking hard sometimes)  

---

## Implementation

### Pre-commit Hook (Local)
```bash
#!/bin/bash
npm run lint
npm run test:unit --coverage
# Fail if < 80% coverage
```

### CI Pipeline
```yaml
- name: Unit Tests
  run: npm test -- --coverage
  
- name: Integration Tests
  run: npm run test:integration
  
- name: E2E Tests
  run: npm run test:e2e
  
- name: Coverage Report
  run: codecov
```

### Test Naming
```
describe('UserService.authenticate', () => {
  it('should return token when credentials valid', ...)
  it('should throw when password incorrect', ...)
  it('should lock account after 5 failures', ...)
})
```

---

## Related ADRs
- ADR-003: Database (Testcontainers isolation)
- ADR-006: Logging (test instrumentation)

---

## Approval
- **Approved By**: QA Lead, Engineering Lead | **Review Date**: 2027-03-28

