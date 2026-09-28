# AI Security Rules Instructions

## Security-First Approach

**Every code change must be security-reviewed**. Never ship code with:
- Hardcoded secrets/passwords
- Missing input validation
- SQL injection vulnerabilities
- XSS vulnerabilities
- Missing authentication checks
- Insufficient authorization (RBAC)

## Critical Security Rules

### 1. Secrets & Credentials
```typescript
// ❌ NEVER
const password = "admin123";
const apiKey = "sk_live_abc123";

// ✅ ALWAYS
const password = process.env.DB_PASSWORD;
const apiKey = process.env.STRIPE_API_KEY;
```

### 2. Input Validation
```typescript
// ❌ NEVER
app.post('/user', (req, res) => {
  const user = req.body; // No validation!
  db.save(user);
});

// ✅ ALWAYS
app.post('/user', (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) throw new ValidationError(error);
  db.save(value);
});
```

### 3. SQL/NoSQL Injection
```typescript
// ❌ NEVER (SQL injection vulnerable)
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ ALWAYS (parameterized)
db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 4. Authentication & Authorization
```typescript
// ❌ NEVER (missing auth check)
app.get('/api/courses/:id', (req, res) => {
  res.json(getCourse(req.params.id));
});

// ✅ ALWAYS (auth required)
app.get('/api/courses/:id', 
  authenticateUser(),
  authorizeCourse('read'),
  (req, res) => {
    res.json(getCourse(req.params.id));
  }
);
```

### 5. XSS Prevention
```typescript
// ❌ NEVER (XSS vulnerable)
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ ALWAYS (escaped)
<div>{userContent}</div>
```

### 6. CSRF Protection
```typescript
// ✅ ALWAYS use CSRF tokens for state-changing operations
app.post('/courses', csrfProtection, (req, res) => { ... });
```

### 7. Rate Limiting
```typescript
// ✅ ALWAYS rate limit authentication endpoints
app.post('/auth/login', rateLimit({ windowMs: 15*60*1000, max: 5 }), (req, res) => { ... });
```

### 8. Encryption
- **At Rest**: AES-256 for sensitive data (PII, assessments)
- **In Transit**: TLS 1.2+ for all network communication
- **Passwords**: bcrypt or scrypt (never plaintext)

### 9. Error Messages
```typescript
// ❌ NEVER (leaks info)
res.status(401).json({ error: `User ${email} not found` });

// ✅ ALWAYS (generic)
res.status(401).json({ error: 'Invalid credentials' });
```

### 10. Dependency Vulnerabilities
- Use `npm audit` before committing
- Never ignore security vulnerabilities
- Keep dependencies updated
- Check transitive dependencies

## OWASP Top 10 Checklist

✅ **A01: Broken Access Control**
- [ ] RBAC enforced at API layer
- [ ] Row-level security active (org_id filtering)
- [ ] Admin endpoints protected

✅ **A02: Cryptographic Failures**
- [ ] Encryption key management secure
- [ ] Passwords hashed (bcrypt)
- [ ] TLS 1.2+ enforced

✅ **A03: Injection**
- [ ] Parameterized queries (no string concat)
- [ ] Input validation on all endpoints
- [ ] Command injection prevention

✅ **A04: Insecure Design**
- [ ] Security requirements documented
- [ ] Threat modeling performed
- [ ] Secure by default settings

✅ **A05: Security Misconfiguration**
- [ ] No debug mode in production
- [ ] Security headers set (CSP, X-Frame-Options)
- [ ] Default credentials changed

✅ **A06: Vulnerable Components**
- [ ] Dependencies audited
- [ ] Known vulnerabilities patched
- [ ] SCA scanning enabled

✅ **A07: Authentication Failures**
- [ ] MFA support for sensitive accounts
- [ ] Password reset secure
- [ ] Session management correct

✅ **A08: Data Integrity Failures**
- [ ] API input validated
- [ ] Serialization attacks prevented
- [ ] CI/CD pipeline secured

✅ **A09: Logging & Monitoring**
- [ ] Security events logged
- [ ] No sensitive data in logs
- [ ] Alerts configured

✅ **A10: SSRF**
- [ ] External service URLs validated
- [ ] DNS rebinding prevention
- [ ] Internal services protected

## Multi-Tenancy Security

- **Row-Level Security (RLS)**: Filter all queries by org_id
- **Data Isolation**: No cross-org data access
- **Audit Trail**: Log all data access
- **Key Isolation**: Encryption keys per tenant (if applicable)

## When in Doubt

1. Ask: "Could an attacker exploit this?"
2. Validate all external input
3. Use parameterized queries
4. Encrypt sensitive data
5. Authenticate and authorize
6. Log security events
7. Run security tools (SAST, dependency scan)

