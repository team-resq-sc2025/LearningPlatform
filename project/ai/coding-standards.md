# AI Coding Standards Instructions

## Code Style & Organization

### Naming Conventions
- **Files**: kebab-case (user-service.ts, assessment.controller.ts)
- **Classes**: PascalCase (UserService, AssessmentController)
- **Functions/Methods**: camelCase (getUserById, submitAssessment)
- **Constants**: UPPER_SNAKE_CASE (MAX_RETRIES, API_TIMEOUT)
- **Variables**: camelCase (userId, courseId, isActive)
- **Database**: snake_case (user_id, created_at)

### Code Organization
```
src/
├── services/          # Business logic
├── controllers/       # HTTP handlers
├── models/            # Data models (TypeORM, Mongoose)
├── repositories/      # Data access layer
├── middleware/        # Express/HTTP middleware
├── utils/             # Utility functions
├── constants/         # Constants
├── types/             # TypeScript interfaces
├── tests/             # Unit tests (co-located with source)
└── config/            # Configuration
```

## Best Practices

### Functions & Methods
- **Single Responsibility**: One function, one purpose
- **Small Functions**: Aim for < 20 lines
- **Explicit Returns**: Always return something or void
- **Error Handling**: Throw exceptions, don't return null
- **No Side Effects**: Prefer pure functions

### Classes & Objects
- **Single Responsibility**: One reason to change
- **DRY (Don't Repeat Yourself)**: Extract common logic
- **SOLID Principles**: Follow S, O, L, I, D
- **Composition Over Inheritance**: Prefer composition
- **Immutability**: Const by default, minimize mutations

### Comments & Documentation
- **No Comments for WHAT**: Code should be self-documenting
- **Comments for WHY**: Explain business logic, non-obvious decisions
- **NO multi-line docstrings**: Single-line comments only (1-2 lines max)
- **JSDoc for public APIs**: Only for exported functions
- **No obsolete comments**: Delete if code changes

### Error Handling
```typescript
// Good: Explicit error handling
try {
  const user = await getUserById(id);
  return user;
} catch (error) {
  if (error instanceof NotFoundError) {
    throw new NotFoundException(`User ${id} not found`);
  }
  throw error;
}

// Bad: Swallowing errors
try { ... } catch (e) { return null; }
```

### Testing
- **Unit tests required**: Min 80% coverage
- **Test file naming**: `*.test.ts` or `*.spec.ts`
- **AAA Pattern**: Arrange, Act, Assert
- **Isolated**: Mock external dependencies
- **No sleep/delays**: Use fake timers instead

## Code Review Checklist

When writing code, ensure:
- [ ] No hardcoded values (use constants, env vars)
- [ ] No console.log in production code (use logger)
- [ ] Error handling present
- [ ] Tests written and passing
- [ ] No obvious performance issues
- [ ] No security vulnerabilities
- [ ] Follows naming conventions
- [ ] No dead code
- [ ] Comments explain WHY, not WHAT

## What NOT to Do

❌ **Never**:
- Hardcode secrets or credentials
- Ignore TypeScript errors
- Use `any` type (use `unknown` instead)
- Catch errors and do nothing (catch and rethrow or handle)
- Create large functions (> 50 lines)
- Use var (use const/let)
- Modify function parameters
- Use setTimeout in tests

✅ **Always**:
- Write tests before fixing bugs
- Handle errors explicitly
- Use descriptive variable names
- Extract magic numbers to constants
- Validate inputs at service boundaries
- Log important operations
- Document complex algorithms

