# ADR-002: Authentication Mechanism (JWT + OAuth2 + MFA)

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28 | **Deciders:** Security, CTO

---

## Context

Need scalable, secure authentication supporting multiple user types (employees, contractors, learners) and SSO integration with enterprise identity providers. Session-based auth doesn't scale well in microservices. Token-based auth provides better distributed system support.

---

## Decision

**Implement JWT tokens + OAuth2 SSO + optional MFA:**

### Authentication Flow
```
1. User Login → Identity Service
2. Validate credentials (local or OAuth2 provider)
3. Generate JWT token (1-hour expiry)
4. Return refresh token (30-day expiry)
5. Client stores JWT in memory (XSS protection)
6. Each request includes JWT in Authorization header
7. Stateless validation in API Gateway
```

### Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_123",
    "org_id": "org_456",
    "roles": ["learner", "instructor"],
    "exp": 1695900000,
    "iat": 1695896400
  },
  "signature": "HMACSHA256(header.payload, secret)"
}
```

### SSO Integration
- **OAuth2 Providers**: Okta, Azure AD, Google, GitHub
- **SAML**: Enterprise federation support
- **LDAP**: On-premises directory sync
- **Fallback**: Local username/password

### MFA Options
- **Primary**: TOTP (Google Authenticator) - required for admins
- **Secondary**: SMS (backup for account recovery)
- **Hardware**: FIDO2 USB keys (optional)
- **Enforcement**: Admin/org-level policies

---

## Rationale

**Why JWT?**
- Stateless: No session storage needed
- Scalable: Works across distributed services
- Standards-based: Wide library support
- Auditable: Token includes user context

**Why OAuth2?**
- Enterprise integration (Okta, Azure AD)
- Delegated auth (user controls permissions)
- Industry standard (easier hiring/security review)
- Phishing-resistant with enterprise providers

**Why Optional MFA?**
- Security: Protects against password breaches
- Compliance: Required for HIPAA, SOX
- User friction: Optional for learners (required for admins)
- Recovery: SMS backup when TOTP device lost

---

## Consequences

### Positive
✅ Stateless, distributed-friendly  
✅ Enterprise SSO integration  
✅ API-first authentication  
✅ Token revocation possible  
✅ Cross-domain support (cookies not needed)  

### Negative
❌ Token size larger than session ID  
❌ Cannot revoke mid-flight (until expiry)  
❌ XSS: If token in localStorage, XSS exposes it  
❌ Complexity: JWT + refresh token flow  
❌ MFA adds friction for users  

### Mitigations
- Store JWT in memory (not localStorage)
- Use httpOnly cookies for refresh tokens
- Short expiry (1 hour) limits compromise window
- Implement token rotation on refresh
- Progressive MFA (required for sensitive operations)

---

## Alternatives

### 1. Session-based Auth
```
Pros: Simple, traditional, revocable immediately
Cons: Doesn't scale in microservices, sticky sessions needed
Decision: Rejected (monolithic only)
```

### 2. SAML Only (Enterprise)
```
Pros: Enterprise standard, full federation
Cons: Complex, verbose, poor for mobile
Decision: Rejected (supports OAuth2 instead)
```

### 3. API Keys Only
```
Pros: Simple for service-to-service
Cons: No user identity, hard to revoke
Decision: Rejected (use for services, JWT for users)
```

### 4. mTLS + Certificates
```
Pros: Cryptographically strong, revocable
Cons: Certificate management complex, poor UX
Decision: Used for service-to-service, not users
```

---

## Implementation Notes

### Token Lifecycle
```
1. Login → Issue access JWT (1 hour) + refresh token (30 days)
2. API Request → Validate JWT, extract user context
3. After 1 hour → Use refresh token to get new JWT
4. Logout → Invalidate refresh token in DB
5. Suspicious activity → Revoke all tokens for user
```

### Security Checklist
- [ ] Use HTTPS/TLS for all auth endpoints
- [ ] Validate JWT signature in every service
- [ ] Implement refresh token rotation
- [ ] Store secrets in AWS Secrets Manager
- [ ] Log all auth events with trace IDs
- [ ] Implement account lockout after 5 failed attempts
- [ ] Force password reset every 90 days
- [ ] Disable TLS < 1.2

### Compliance
- **GDPR**: Support user data export, right to deletion
- **SOX**: Audit trail of all authentication events
- **HIPAA**: MFA required, encryption mandated
- **CCPA**: Clear privacy policy on data usage

---

## Related ADRs
- ADR-004: API Versioning (token in header)
- ADR-008: Configuration & Secrets (token secrets)

---

## Approval
- **Security Officer**: Approved ✅
- **Review Date**: 2027-03-28

