# ADR-003: Database Technology (PostgreSQL Primary + Polyglot)

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28 | **Deciders:** Architecture, Data

---

## Context

Need ACID transactions, complex querying, multi-tenant isolation, and scalability. Single database would be bottleneck at 100K+ users. Multiple database types needed for different workload patterns.

---

## Decision

### Primary: PostgreSQL (OLTP)
- **Version**: 14+
- **Setup**: Primary + 3 read replicas
- **Replication**: Physical streaming replication
- **Sharding**: Hash-based (future) via organization ID
- **Storage**: 1TB base, scalable to 10TB+

### Secondary: TimescaleDB (Analytics)
- **Purpose**: Time-series data for analytics
- **Data**: Aggregated metrics, learner activity
- **Retention**: 7 years
- **Queries**: Milliseconds for rollups

### Tertiary: Elasticsearch (Search)
- **Purpose**: Full-text search, faceted search
- **Data**: Course content, materials, learner profiles
- **Indices**: Sharded by course, rotated daily
- **Queries**: < 1 second

### Quaternary: Redis (Cache)
- **Purpose**: Sessions, hot data, rate limiting
- **Mode**: Cluster (3 nodes)
- **TTL**: 30 minutes to 24 hours
- **Eviction**: LRU when full

### Quinary: S3 (Object Storage)
- **Purpose**: Course videos, PDFs, submissions
- **Versioning**: Enabled
- **Lifecycle**: Tiered (hot 30d, warm 90d, cold 7yr)
- **Backup**: Cross-region replication

---

## Rationale

**PostgreSQL**:
- ACID guarantees (critical for grades, payments)
- JSON/JSONB support (flexible schema)
- Row-level security (native multi-tenancy)
- Full-text search built-in
- Proven at scale (Instagram, Spotify, GitHub)

**TimescaleDB**:
- 100-1000x compression for time-series
- Automatic partitioning by time
- Analytics queries 50x faster than standard DB

**Elasticsearch**:
- Sub-second search across 1M+ documents
- Faceted navigation (filter by difficulty, duration)
- Relevance scoring for ranking results

**Redis**:
- Sub-millisecond latency for sessions
- Atomic operations for rate limiting
- No persistence needed (data can regenerate)

**S3**:
- Unlimited storage (no DB size limits)
- Built-in versioning & lifecycle policies
- CDN integration via CloudFront
- Compliance archival (Glacier)

---

## Consequences

### Positive
✅ Right tool for each workload  
✅ Polyglot: Can evolve independently  
✅ Scalable: Each layer scales independently  
✅ ACID for critical data  
✅ Native multi-tenancy (RLS)  

### Negative
❌ Operational complexity (5 data systems)  
❌ Data consistency across systems  
❌ Schema migrations harder  
❌ Backup/recovery more complex  

### Mitigations
- **Automated Backups**: Nightly snapshots with cross-region replication
- **Infrastructure as Code**: Terraform for reproducible setup
- **Monitoring**: Alert on replica lag, replication errors
- **Documentation**: Clear data ownership per system
- **Testing**: Regularly test backup restoration

---

## Alternatives

### 1. Single PostgreSQL
```
Pros: Simple, ACID everywhere
Cons: Scales to ~10K concurrent users, slow analytics
Rejected: Doesn't meet scale requirements
```

### 2. NoSQL Only (DynamoDB, MongoDB)
```
Pros: Horizontal scaling, flexible schema
Cons: No ACID (critical for payments), eventually consistent
Rejected: Too risky for financial/grade data
```

### 3. Elasticsearch Only
```
Pros: Distributed, scales easily
Cons: No ACID, eventual consistency, not for transactional
Rejected: Can't handle orders (assessments) reliably
```

---

## Implementation

### Multi-tenancy via RLS
```sql
CREATE POLICY tenant_isolation ON courses
  USING (org_id = current_setting('tenant.org_id')::uuid);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
```

### Replication Monitoring
```
Primary DB → Replica 1 (same AZ, <100ms lag)
         → Replica 2 (different AZ, <500ms lag)
         → Replica 3 (different region, <5s lag, backup)
```

### Failover Strategy
```
1. Detect primary down (health check fails)
2. Promote replica 1 to primary (automated)
3. RTO: 5 minutes, RPO: 1 minute
4. Manual: Promote secondary region replica
5. RTO: 30 minutes, RPO: 15 minutes
```

---

## Related ADRs
- ADR-005: Event/Message Architecture (async to other DBs)
- ADR-006: Logging & Telemetry (metrics to TimescaleDB)

---

## Approval
- **Approved By**: CTO, Database Team | **Review Date**: 2027-03-28

