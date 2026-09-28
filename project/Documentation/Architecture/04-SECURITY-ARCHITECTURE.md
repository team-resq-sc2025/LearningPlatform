# 4. Security Architecture

**Document ID:** ARCH-004-SECURITY | **Status:** 🟢 ACTIVE | **Version:** 1.0.0

---

## 4.1 Defense-in-Depth Model

```
Layer 1: Perimeter  → DDoS (AWS Shield) + WAF (AWS WAF) + IP filtering
Layer 2: Network    → VPC + Security Groups + NACLs + TLS 1.2+
Layer 3: API        → API Key + JWT + Rate limiting
Layer 4: Auth       → MFA + Password policies + Session management
Layer 5: RBAC       → Role-based + Attribute-based access control
Layer 6: Data       → AES-256 encryption + Field-level encryption + Masking
Layer 7: Audit      → All actions logged + Immutable audit trails
```

---

## 4.2 Authentication & MFA

### **Authentication Methods**
- **Local**: Username/password + bcrypt hashing
- **SSO**: OAuth2 (Okta, Google, Azure AD)
- **SAML**: Enterprise federation
- **LDAP**: On-premises directory sync

### **Multi-Factor Authentication**
- **TOTP**: Time-based one-time password (Google Authenticator)
- **SMS**: Backup fallback (no SMS-only)
- **Hardware Keys**: FIDO2 USB keys
- **Mandatory**: For admins, optional for users

### **Session Management**
- **Duration**: 30 min inactivity timeout
- **Absolute**: 8 hour maximum session
- **Revocation**: Immediate on logout
- **Storage**: Encrypted session cookies (HttpOnly, Secure, SameSite)

---

## 4.3 Authorization (RBAC/ABAC)

### **Role Hierarchy**
```
Superadmin (Platform)
  ├─ Organization Admin
  │  ├─ Instructor
  │  │  └─ Grader
  │  ├─ Manager
  │  └─ Support
  └─ Learner
```

### **Permissions Model**
- **Resource-level**: Can create/read/update/delete courses
- **Org-level**: Isolated data by organization
- **Tenant isolation**: Row-level security (RLS) in database
- **Attribute-based**: Can grade only own courses

---

## 4.4 Data Protection

### **Encryption at Rest**
- **Database**: AES-256 (customer-managed keys)
- **Backups**: AES-256 (separate key)
- **S3 Objects**: AES-256 with KMS
- **Key Rotation**: Annual

### **Encryption in Transit**
- **TLS 1.2+**: All network communication
- **Mutual TLS**: Service-to-service
- **Certificate Pinning**: External APIs
- **Perfect Forward Secrecy**: Ephemeral keys

### **Sensitive Data Handling**
- **PII**: Encrypted with field-level encryption
- **Passwords**: Never stored, only hashes
- **Tokens**: Expired after 1 hour
- **Logs**: Automatically redacted for PII

---

## 4.5 API Security

### **Rate Limiting**
- **Per User**: 1,000 req/hour
- **Per IP**: 10,000 req/hour
- **Per Endpoint**: 100 req/minute
- **Burst**: 50 requests/second

### **Input Validation**
- **Schema Validation**: JSON Schema enforcement
- **SQL Injection**: Parameterized queries
- **XSS**: HTML encoding + CSP headers
- **CSRF**: SameSite cookies

### **API Keys**
- **Format**: Bearer tokens (25 char random)
- **Rotation**: Every 90 days
- **Scope**: Read-only / write / admin
- **Revocation**: Immediate, no delay

---

## 4.6 Compliance & Audit

### **Audit Logging**
```json
{
  "timestamp": "2026-09-28T10:30:00Z",
  "user_id": "user_123",
  "action": "course_published",
  "resource": "course_456",
  "status": "success",
  "trace_id": "abc-def-ghi",
  "ip_address": "192.168.1.1"
}
```

### **Retention**
- **Hot**: 90 days (Elasticsearch)
- **Warm**: 1-2 years (S3)
- **Cold**: 7 years (Glacier)

### **Compliance Requirements**
- **GDPR**: Right to access, delete, portability
- **CCPA**: Consumer privacy rights
- **HIPAA**: If handling health data
- **SOX**: Financial controls if applicable

---

## 4.7 Secrets Management

| Secret Type | Storage | Rotation | Access |
|-------------|---------|----------|--------|
| API Keys | AWS Secrets Manager | 90 days | Service principals |
| DB Passwords | AWS Secrets Manager | 30 days (auto) | RDS IAM auth |
| Encryption Keys | AWS KMS | Annual | Audit log only |
| OAuth Secrets | AWS Secrets Manager | 60 days | Integration service |

---

## 4.8 Threat Modeling

### **High-Risk Threats**
1. **Data Breach**: Mitigated by encryption + access controls
2. **Account Takeover**: Mitigated by MFA + rate limiting
3. **DDoS Attack**: Mitigated by AWS Shield + WAF
4. **Insider Threat**: Mitigated by audit logging + least privilege
5. **Supply Chain**: Mitigated by vendor security assessment

### **Incident Response**
- **Detection**: Automated alerts on anomalies
- **Response**: On-call team (< 15 min)
- **Containment**: Isolate affected systems (< 1 hour)
- **Recovery**: Restore from clean backup (< 2 hours)
- **Communication**: Notify users (within SLA)

---

## 4.9 Vulnerability Management

- **SAST**: SonarQube on every build
- **DAST**: OWASP ZAP nightly scans
- **Dependency Scanning**: Snyk for npm/pip packages
- **Penetration Testing**: Quarterly by external firm
- **Patch Management**: Critical within 24 hours

---

## 4.10 Security Checklist

- [ ] TLS 1.2+ on all external connections
- [ ] MFA enabled for all admin accounts
- [ ] Encryption for all PII data
- [ ] Audit logging of sensitive operations
- [ ] Regular backup testing
- [ ] Penetration testing completed
- [ ] Vulnerability assessment < 30 days old
- [ ] Security training for all engineers
- [ ] Incident response plan documented
- [ ] DRP tested within 6 months

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Author** | Security Team |
| **Version** | 1.0.0 |
| **Approval** | Security Officer |
