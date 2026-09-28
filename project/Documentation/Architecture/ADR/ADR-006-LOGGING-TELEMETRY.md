# ADR-006: Logging & Telemetry (ELK + Prometheus + Jaeger)

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28

---

## Decision

**Three-pillar observability:**

### Logs (ELK Stack)
- **Collection**: Fluentd agents → Elasticsearch
- **Retention**: 90 days hot, 7 years archive
- **Format**: Structured JSON with trace ID
- **Queries**: Kibana UI + API

### Metrics (Prometheus + Grafana)
- **Collection**: Prometheus scrapes /metrics (30s interval)
- **Storage**: 15 days real-time + TimescaleDB long-term
- **Visualization**: Grafana dashboards
- **Alerting**: Alertmanager → PagerDuty

### Traces (Jaeger)
- **Collection**: OpenTelemetry SDK in each service
- **Sampling**: 100% for errors, 1% for normal
- **Storage**: 14 days
- **Analysis**: Jaeger UI for distributed debugging

### Unified Context
```
All three systems linked via trace_id:
  Log: "timestamp: 2026-09-28T10:30:00Z, trace_id: abc-def"
  Metric: "http_requests_total{trace_id: abc-def}"
  Trace: "root_span{trace_id: abc-def}"
```

---

## Rationale

**Why ELK?**
- Standard for centralized logging
- Full-text search on logs
- Retention and archival built-in

**Why Prometheus?**
- Time-series database for metrics
- Alerting rules support
- Grafana integration seamless

**Why Jaeger?**
- Distributed tracing for microservices
- Causal relationships across services
- Performance analysis (latency breakdown)

**Why Trace ID?**
- Correlates logs, metrics, traces
- Follow single request across services
- Debugging becomes much easier

---

## Consequences

### Positive
✅ Unified observability  
✅ Easy debugging in distributed system  
✅ Performance insights  
✅ Compliance-ready audit trail  

### Negative
❌ Storage costs (logs, metrics, traces)  
❌ Operational overhead  
❌ Data privacy (PII in logs)  

### Mitigations
- **Sampling**: Reduce trace volume with smart sampling
- **Retention**: Archive to cold storage after 90d
- **Filtering**: Exclude PII from logs (redaction)
- **Automation**: Infrastructure-as-code for stack

---

## Implementation

### Fluentd Configuration
```
<source>
  @type tail
  path /var/log/pods/**/*/*.log
  tag kubernetes.*
</source>

<filter kubernetes.**>
  @type parser
  key_name log
  <parse>
    @type json
  </parse>
</filter>

<match **>
  @type elasticsearch
  host elasticsearch
  port 9200
  logstash_format true
</match>
```

### Prometheus Alerts
```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
  for: 5m
  annotations:
    summary: "Service {{ $labels.service }} high errors"
```

### OpenTelemetry in Code
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("process_submission"):
    # Your code here
    submission = process(request)
```

---

## Related ADRs
- ADR-001: Application Architecture (instrumentation per service)
- ADR-008: Configuration & Secrets (telemetry credentials)

---

## Approval
- **Approved By**: CTO, SRE Team | **Review Date**: 2027-03-28

