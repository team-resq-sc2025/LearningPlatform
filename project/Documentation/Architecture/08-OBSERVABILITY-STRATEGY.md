# 8. Observability Strategy

**Document ID:** ARCH-008-OBSERVABILITY | **Status:** 🟢 ACTIVE | **Version:** 1.0.0

---

## 8.1 Observability Overview

**Three Pillars**:
1. **Logs**: Event records with context
2. **Metrics**: Time-series measurements
3. **Traces**: Request flow across services

---

## 8.2 Logging Architecture

### **Log Levels**
| Level | Use Case | Volume |
|-------|----------|--------|
| DEBUG | Dev troubleshooting | High (dev only) |
| INFO | Application events | Medium (1M/day) |
| WARN | Degraded functionality | Low (100K/day) |
| ERROR | Errors needing action | Low (10K/day) |
| FATAL | System failure | Very low (< 1K/day) |

### **Structured Logging**
```json
{
  "timestamp": "2026-09-28T10:30:00Z",
  "level": "INFO",
  "service": "assessment-service",
  "trace_id": "abc-def-ghi",
  "user_id": "user_123",
  "action": "submission_graded",
  "duration_ms": 1245,
  "status": "success"
}
```

### **Log Retention**
- **Hot**: 90 days (Elasticsearch) - searchable
- **Warm**: 1 year (S3) - retrievable in hours
- **Cold**: 7 years (Glacier) - legal/compliance

### **Log Collection**
- **Method**: Fluentd/Logstash agents
- **Frequency**: Real-time
- **Batch Size**: 1000 logs or 5 seconds
- **Parsing**: JSON structured format

---

## 8.3 Metrics Architecture

### **Key Metrics by Service**

**Application Metrics**:
```
http_requests_total{service, endpoint, method, status}
http_request_duration_seconds{service, endpoint, quantile}
database_connections_active{service}
cache_hits_total{service}
grading_jobs_queued{service}
```

**Business Metrics**:
```
courses_created_total
learners_enrolled_total
assessments_submitted_total
certificates_issued_total
learner_completion_rate
```

**Infrastructure Metrics**:
```
container_cpu_usage_percent{pod, namespace}
container_memory_usage_bytes{pod, namespace}
pod_restarts_total{pod}
pvc_usage_percent{pod, volume}
```

### **Metric Scraping**
- **Scraper**: Prometheus
- **Interval**: Every 30 seconds
- **Retention**: 15 days (real-time)
- **Long-term**: Move to TimescaleDB after 15 days

### **Alerting Rules**

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | Errors > 1% | Critical | Page on-call |
| High Latency | p95 > 1 second | Warning | Alert ops team |
| Service Down | No response | Critical | Auto-failover |
| Memory Leak | Growing memory | Warning | Alert team |
| Disk Full | > 90% usage | Critical | Page on-call |

---

## 8.4 Distributed Tracing

### **Trace Generation**
```
User Request
  │
  ├─ API Gateway [span: auth, 45ms]
  │
  ├─ LMS Service [span: query, 120ms]
  │  ├─ Database [span: select, 80ms]
  │  └─ Cache [span: miss, 5ms]
  │
  ├─ Analytics Service [span: event, 30ms]
  │
  └─ Response [total: 195ms]
```

### **Trace Sampling**
- **Error Traces**: 100% sampled (always captured)
- **Slow Traces**: Traces > 1 second (100% sampled)
- **Normal Traces**: 1% sample rate (avoid overhead)
- **Debug Mode**: 100% for specific users/services

### **Trace Storage**
- **Backend**: Jaeger / Tempo
- **Retention**: 14 days hot, 90 days warm
- **Query**: Trace latency breakdown, error analysis

---

## 8.5 Dashboards

### **Operations Dashboard**
- System health (uptime, error rate)
- Service dependencies (status, latency)
- Infrastructure utilization (CPU, memory, disk)
- Alert status and incidents

### **Business Dashboard**
- Learner enrollment trends
- Course completion rates
- Assessment pass rates
- Revenue metrics

### **Developer Dashboard**
- API latencies by endpoint
- Error rates and types
- Database query performance
- Cache hit rates

---

## 8.6 Health Checks

### **Service Health**
```
GET /health/live
  Response: 200 OK (service running)

GET /health/ready
  Response: 200 OK (ready to serve traffic)
  Checks: Database, cache, external APIs
```

### **Health Check Endpoints**
```
GET /health/startup
  → Check all dependencies ready

GET /health/live
  → Check service process alive
  → Responds: < 10ms

GET /health/ready
  → Check able to serve requests
  → Checks: DB connection, cache, APIs
  → Timeout: 5 seconds
```

### **Health Check Results**
```json
{
  "status": "UP",
  "components": {
    "database": { "status": "UP", "latency_ms": 12 },
    "redis": { "status": "UP", "latency_ms": 2 },
    "elasticsearch": { "status": "UP", "latency_ms": 45 },
    "external_api": { "status": "DOWN", "error": "timeout" }
  }
}
```

---

## 8.7 Synthetic Monitoring

### **Uptime Monitors**
```
Every 60 seconds, external monitor checks:
  GET /health/live
    Expected: 200 OK
    Timeout: 5 seconds
    
If fails 3 consecutive times:
  → Alert ops team
  → Page on-call if production
```

### **API Monitors**
```
Every 5 minutes:
  - Login flow (authentication)
  - Course enrollment
  - Assessment submission
  - Grading completion
  
Verify: Success within 10 seconds
Alert: If fails 2+ consecutive times
```

### **Transaction Monitors**
```
Every 30 minutes:
  - Full learner journey (login → enroll → complete)
  - Payment processing
  - Certificate issuance
  
Duration target: < 30 seconds
Alert: If > 1 minute or failed
```

---

## 8.8 Observability Runbooks

### **High Error Rate Response**
1. Check alerts (error type, service)
2. Review recent deployments
3. Check infrastructure (CPU, memory)
4. Review logs for error patterns
5. Determine if rollback needed
6. Communicate to stakeholders

### **High Latency Response**
1. Check which endpoint slow
2. Check database query performance
3. Check cache hit rates
4. Check service dependencies
5. Check infrastructure load
6. Scale if needed

### **Service Down Response**
1. Verify service down (not just slow)
2. Check health check results
3. Check recent changes
4. Restart service if safe
5. Failover to replica if available
6. Engage incident commander

---

## 8.9 Observability Maturity Model

| Level | Characteristics |
|-------|-----------------|
| **1: Basic** | Logs only, manual debugging |
| **2: Structured** | Structured logs, basic metrics |
| **3: Correlated** | Logs + metrics + basic traces |
| **4: Automated** | Full observability, auto-alerts, runbooks |
| **5: Predictive** | ML anomaly detection, predictive alerting |

**Target**: Level 4 (Full observability with automation)

---

## 8.10 SLOs & Error Budgets

### **Service Level Objectives**
```
Availability: 99.9%
  = 8.76 hours downtime per year
  = Error budget: 43 minutes per month

Latency: p95 < 500ms
  = 95% of requests within 500ms
  = Error budget: 5% of requests can be > 500ms

Error Rate: < 0.1%
  = Error budget: 0.1% of requests can fail
```

### **Error Budget Tracking**
- Track actual vs. error budget daily
- If exceeding budget: Reduce deployments
- If under budget: Can take risks (deploy more)
- Monthly review: Adjust SLOs if needed

---

## 8.11 Observability Tools Stack

| Category | Tool | Purpose |
|----------|------|---------|
| Logs | Elasticsearch + Kibana | Log storage & search |
| Metrics | Prometheus + Grafana | Metrics collection & visualization |
| Traces | Jaeger / Tempo | Distributed tracing |
| Alerts | Alertmanager + PagerDuty | Alert routing & on-call |
| APM | Datadog / New Relic (optional) | Full-stack monitoring |

---

## 8.12 Cost Optimization

- **Sampling**: Reduce trace volume with smart sampling
- **Retention**: Archive hot logs to S3 after 30 days
- **Filtering**: Don't log debug statements in production
- **Compression**: Compress logs before archival
- **Deduplication**: Remove duplicate error logs

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Author** | SRE & Platform Team |
| **Version** | 1.0.0 |
| **Review Cycle** | Quarterly |
