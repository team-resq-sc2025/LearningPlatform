# ADR-008: Configuration & Secrets Management

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28

---

## Decision

**Separate configuration from secrets, use external systems:**

### Configuration (Non-Sensitive)
- **Source**: Environment variables + ConfigMap/dotenv
- **Examples**: API versions, feature flags, log levels
- **Storage**: Git repository (version controlled)
- **Pattern**: 
  ```
  NODE_ENV=production
  LOG_LEVEL=info
  API_VERSION=v2
  FEATURE_FLAG_AI_GRADING=true
  ```

### Secrets (Sensitive)
- **Source**: AWS Secrets Manager / Azure Key Vault
- **Examples**: Database passwords, API keys, encryption keys
- **Access**: Service accounts with IAM policies
- **Rotation**: Automatic (30 days for DB, 90 days for API keys)
- **Pattern**:
  ```
  DB_PASSWORD: /secrets/prod/db-password
  STRIPE_KEY: /secrets/prod/stripe-api-key
  JWT_SECRET: /secrets/prod/jwt-secret
  ```

### Secret Rotation
```
Database Passwords: Every 30 days (automatic)
API Keys: Every 90 days (manual or automatic)
Encryption Keys: Annual rotation
SSL Certificates: Annual renewal (60 days before expiry)
```

### Access Control
```
Database Password → RDS IAM authentication (no hardcoded password)
API Keys → Service accounts only, audit logged
Encryption Keys → KMS with key policies
JWT Secret → Shared across services securely
```

---

## Rationale

**Why External Secrets Manager?**
- Never in code/git (accidental commits)
- Audit trail of access
- Easy rotation
- No SSH key distribution needed

**Why Separate Config?**
- Different change frequency
- Configuration is team concern
- Secrets are security concern
- Git-friendly for config

**Why Automatic Rotation?**
- Reduces human error
- Regular key changes good security hygiene
- Automated if possible (DB), manual if needed (external APIs)

---

## Consequences

### Positive
✅ Secrets never in code  
✅ Audit trail of access  
✅ Easy rotation  
✅ Per-environment secrets  

### Negative
❌ Additional service dependency  
❌ Complexity in local dev  
❌ Rotation coordination needed  

### Mitigations
- **Local Dev**: dotenv files (not in git) for development
- **Testing**: Mock secret manager for tests
- **Monitoring**: Alert on rotation failures

---

## Implementation

### Spring Boot with AWS Secrets Manager
```properties
spring.config.import=aws-secretsmanager:prod/database-password
```

```java
@Value("${db.password}")
private String dbPassword;
```

### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-credentials
type: Opaque
stringData:
  password: ENC[AES256_GCM,...] # Encrypted
```

### .env (Local Dev Only - NOT IN GIT)
```
DB_PASSWORD=local_dev_password
API_KEY=local_dev_key
# .env in .gitignore
```

### Env Vars in Docker
```dockerfile
# Don't COPY secrets
COPY app /app
# Instead, mount as volume or pass at runtime
# docker run -e DB_PASSWORD="..." myapp
```

---

## Security Checklist
- [ ] No secrets in code/git
- [ ] All secrets encrypted at rest
- [ ] Rotation policy defined per secret type
- [ ] Access audit logging enabled
- [ ] CI/CD has secrets manager access
- [ ] Local dev uses non-production secrets

---

## Related ADRs
- ADR-002: Authentication (JWT secret storage)
- ADR-004: API Versioning (API key rotation)

---

## Approval
- **Approved By**: Security Team, CTO | **Review Date**: 2027-03-28

