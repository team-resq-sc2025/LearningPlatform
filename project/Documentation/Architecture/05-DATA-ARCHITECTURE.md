# 5. Data Architecture

**Document ID:** ARCH-005-DATA | **Status:** 🟢 ACTIVE | **Version:** 1.0.0

---

## 5.1 Data Strategy Overview

**Principles**:
- Single source of truth (SSOT)
- Data governance & quality
- Privacy by design
- Performance optimization
- Disaster recovery ready

---

## 5.2 Data Domains

### **Operational Data** (Hot)
- **Storage**: PostgreSQL (primary + 3 replicas)
- **Latency**: < 50ms
- **Retention**: 2+ years (operational)
- **Backup**: Daily snapshots
- **Entities**: Users, courses, enrollments, assessments

### **Analytical Data** (Warm)
- **Storage**: TimescaleDB / ClickHouse
- **Latency**: < 1 second for aggregates
- **Retention**: 7 years
- **Backup**: Weekly snapshots
- **Entities**: Aggregated metrics, learner performance

### **Archived Data** (Cold)
- **Storage**: S3 Glacier Deep Archive
- **Latency**: Hours to retrieve
- **Retention**: 7+ years (compliance)
- **Backup**: Geo-redundant copies
- **Entities**: Historical submissions, old courses

### **Search Data** (Index)
- **Storage**: Elasticsearch
- **Latency**: < 1 second
- **Retention**: 90 days
- **Refresh**: Real-time
- **Entities**: Courses, materials, learner profiles

---

## 5.3 Data Model (Key Entities)

```
Organization
├─ User (authenticated)
│  └─ Role (Admin, Instructor, Learner)
├─ Course
│  ├─ Module
│  │  └─ Lesson (content units)
│  ├─ Assessment (exam)
│  │  ├─ Question (MCQ, essay, code)
│  │  └─ Submission (learner answers)
│  └─ Enrollment (learner enrollment)
│     └─ Progress (completion tracking)
├─ Certificate
├─ Content (materials, videos)
└─ Activity Log (audit trail)
```

---

## 5.4 Data Governance

### **Data Classification**
- **Public**: Course catalogs, public profiles
- **Internal**: Course content, learner data
- **Confidential**: Assessment answers, payment info
- **Restricted**: Passwords, encryption keys

### **Access Control**
- **Public**: No auth required
- **Internal**: Org members only
- **Confidential**: Admin/instructor approval
- **Restricted**: Service-to-service only

### **Data Lineage**
- All data transformations tracked
- ETL pipelines documented
- Source to destination mapping
- Audit trail for compliance

---

## 5.5 Data Pipeline Architecture

```
Source Systems
  ↓ (ETL / Streaming)
Data Ingestion Layer
  ├─ Real-time (Kafka) → Hot Storage (PostgreSQL)
  └─ Batch (S3) → Warm Storage (Analytics DB)
  ↓
Data Transformation
  ├─ Normalization
  ├─ Aggregation
  └─ Enrichment
  ↓
Data Warehouse
  ├─ Fact tables (learner_activity, grades)
  └─ Dimension tables (users, courses)
  ↓
Data Marts
  ├─ Learner analytics
  ├─ Instructor insights
  └─ Executive dashboards
```

---

## 5.6 Backup & Recovery Strategy

### **Backup Schedule**
- **Incremental**: Daily (5 GB → 100 GB)
- **Full**: Weekly (100 GB snapshot)
- **Long-term**: Monthly archives (7-year retention)

### **Backup Locations**
- **Primary**: Same region (RTO < 5 min)
- **Secondary**: Different region (RTO < 30 min)
- **Tertiary**: Different cloud (geo-distributed)

### **Recovery Testing**
- **Frequency**: Quarterly
- **Scope**: Test 10% of backup
- **Validation**: Data integrity checks
- **Documentation**: Recovery runbook

---

## 5.7 Data Privacy & GDPR Compliance

### **Right to Access**
- Users can export their data
- Format: JSON, CSV
- Turnaround: < 30 days

### **Right to Deletion** (Right to be Forgotten)
- Anonymize user data
- Delete PII from all systems
- Retain for compliance: 1 year max
- Audit trail: Permanent

### **Data Minimization**
- Collect only necessary data
- Delete after retention period
- No tracking without consent
- Transparent privacy policy

### **Cross-border Transfers**
- EU data → EU data centers
- Standard contractual clauses (SCCs)
- Data Processing Agreement (DPA)

---

## 5.8 Performance Optimization

### **Indexing Strategy**
```sql
-- High-cardinality, frequently filtered columns
CREATE INDEX idx_course_status ON courses(status);
CREATE INDEX idx_user_org_id ON users(organization_id);
CREATE INDEX idx_enrollment_user ON enrollments(user_id, course_id);

-- Composite indexes for common queries
CREATE INDEX idx_activity_user_date ON activity_log(user_id, created_at DESC);
```

### **Query Optimization**
- Analyze slow queries (> 1 second)
- Add indexes before query planning
- Denormalize for read-heavy workloads
- Cache frequently accessed data

### **Partitioning Strategy**
```
-- Partition learner_activity by date (rolling window)
learner_activity_2026_01 (Jan data)
learner_activity_2026_02 (Feb data)
learner_activity_current (Active month)
```

---

## 5.9 Data Validation & Quality

| Rule | Frequency | Action |
|------|-----------|--------|
| Referential Integrity | On insert | Reject if FK missing |
| Data Type Validation | Real-time | Enforce schema |
| Uniqueness Constraints | Real-time | Prevent duplicates |
| Business Rules | Daily audit | Flag violations |
| Completeness | Weekly report | Identify nulls |

---

## 5.10 Data Retention Policy

| Data Type | Retention | Archive | Deletion |
|-----------|-----------|---------|----------|
| User Profile | 7 years | 2 years cold | On request |
| Course Content | Indefinite | N/A | Never |
| Assessment Answers | 7 years | 5 years cold | On request |
| Learner Activity | 2 years | Hot only | Auto-purge |
| Payment Records | 7 years | 5 years cold | Auto-purge |
| Audit Logs | 7 years | All cold | Never |

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Author** | Data Architecture Team |
| **Version** | 1.0.0 |
| **Approval** | Chief Data Officer |
