# AI Testing Rules Instructions

## Testing Requirements

**All code changes must include tests**. The target is:
- **Unit Tests**: 80% code coverage minimum
- **Integration Tests**: Critical paths (enrollment, assessment, grading)
- **E2E Tests**: User journeys (login → enroll → submit → grade)

## Unit Testing Rules

### Structure (AAA Pattern)
```typescript
describe('UserService.authenticate', () => {
  it('should return token when credentials valid', () => {
    // Arrange
    const mockUser = { id: '1', password: 'hashed' };
    const mockDb = { findByEmail: jest.fn().mockResolvedValue(mockUser) };
    const service = new UserService(mockDb);
    
    // Act
    const token = await service.authenticate('user@test.com', 'password123');
    
    // Assert
    expect(token).toBeDefined();
    expect(mockDb.findByEmail).toHaveBeenCalledWith('user@test.com');
  });
});
```

### Mocking External Dependencies
```typescript
// ✅ ALWAYS mock external services
const mockDb = jest.mock('./database');
const mockCache = jest.mock('./cache');
const mockEmail = jest.mock('./email');

// Never call real database, cache, or email in unit tests
```

### Coverage Requirements
- **Critical business logic**: 95%+
- **Core services**: 85%+
- **Utilities**: 80%+
- **Controllers/Routes**: 70%+
- **Overall**: 80%+

### Test Data
```typescript
// Use factories for test data
const createTestUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  role: 'learner',
  ...overrides
});

const testUser = createTestUser({ role: 'instructor' });
```

## Integration Testing Rules

### What to Test
- Service interactions (Service A calls Service B)
- Database operations (CRUD with real schema)
- Message queue integration (Kafka topics)
- Cache behavior (Redis operations)
- External API calls (with mocked responses)

### Test Containers
```typescript
// Use Testcontainers for isolated environments
const postgres = new PostgresContainer();
const redis = new RedisContainer();
const kafka = new KafkaContainer();

beforeAll(async () => {
  await postgres.start();
  await redis.start();
  await kafka.start();
});

afterAll(async () => {
  await postgres.stop();
  await redis.stop();
  await kafka.stop();
});
```

### Database Testing
```typescript
// ✅ Use transactions to rollback test changes
beforeEach(async () => {
  await db.transaction(async (trx) => {
    // Insert test data
    await trx('users').insert(testUser);
    // Test runs here
  });
  // Automatically rolled back
});
```

## E2E Testing Rules

### User Journeys to Test
1. **Authentication**: Login → Dashboard
2. **Course Enrollment**: Browse → Enroll → Verify enrolled
3. **Assessment**: Start exam → Answer questions → Submit → See results
4. **Grading**: Submit assessment → Auto-grade → Review feedback
5. **Progress**: Complete lessons → Check progress percentage

### Tool & Approach
```typescript
// Use Playwright for reliable E2E tests
import { test, expect } from '@playwright/test';

test('learner can enroll and view course', async ({ page }) => {
  // Navigate to app
  await page.goto('https://app.example.com');
  
  // Login
  await page.fill('[data-testid="email"]', 'learner@test.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-btn"]');
  
  // Wait for dashboard
  await page.waitForSelector('[data-testid="dashboard"]');
  
  // Enroll in course
  await page.click('[data-testid="course-enroll"]');
  
  // Verify enrolled
  await expect(page.locator('[data-testid="status"]')).toContainText('Enrolled');
});
```

### Test Selectors
- **Use `data-testid`** for selecting elements: `data-testid="login-btn"`
- **Never use CSS classes/IDs** for testing (they change with styling)
- **Never hardcode text** (brittle with translations)

## Performance Testing Rules

### Load Testing
```
Baseline: 1,000 concurrent users
Spike: 5,000 concurrent users
Latency target: p95 < 500ms
Error rate target: < 0.1%
```

### Tools
- **K6** or **JMeter** for load testing
- **Run weekly** to track regression
- **Alert if** latency increases > 10% or error rate > 1%

## Test Naming

```typescript
// ✅ GOOD (describes behavior)
it('should return 404 when user not found', () => {});
it('should increment progress when lesson completed', () => {});
it('should reject duplicate enrollment', () => {});

// ❌ BAD (vague)
it('works', () => {});
it('test authentication', () => {});
it('should not fail', () => {});
```

## Test Commands

```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:unit --coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

## Before Committing

- [ ] Unit tests passing: `npm run test:unit`
- [ ] Coverage >= 80%: `npm run test:unit --coverage`
- [ ] No test warnings
- [ ] All mocks properly reset
- [ ] No hardcoded test credentials
- [ ] Test database cleaned up

## Test Anti-Patterns to Avoid

❌ **Shared test state** (one test affects another)
❌ **Sleep/timeouts** in tests (use fake timers)
❌ **Test interdependence** (tests must be independent)
❌ **Hidden assertions** (all expectations must be visible)
❌ **Testing implementation** (test behavior, not internals)
❌ **Flaky tests** (use explicit waits, not implicit)

