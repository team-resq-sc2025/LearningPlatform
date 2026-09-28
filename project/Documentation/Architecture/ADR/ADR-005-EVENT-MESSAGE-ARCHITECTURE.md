# ADR-005: Event/Message Architecture (Kafka)

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28

---

## Decision

**Apache Kafka for async event streaming:**

### Topics
- `course.*` - Course events (created, updated, published)
- `assessment.*` - Assessment events (submitted, graded)
- `user.*` - User events (created, updated, logged_in)
- `grading.*` - Grading jobs and results
- `analytics.*` - All platform events for analytics
- `notifications.*` - Notification delivery

### Configuration
- **Brokers**: 3 nodes minimum (HA)
- **Partitions**: 10 per topic (parallelism)
- **Replication**: 3x (durability)
- **Retention**: 30 days default
- **Consumer Groups**: Service-based (analytics, notifications)

### Event Example
```json
{
  "event_id": "evt_123456",
  "event_type": "assessment.submitted",
  "timestamp": "2026-09-28T10:30:00Z",
  "source_service": "assessment-service",
  "data": {
    "assessment_id": "asmt_789",
    "user_id": "user_456",
    "submission_id": "sub_123"
  },
  "trace_id": "abc-def-ghi"
}
```

### Consumer Pattern
```
Producer (Assessment Service)
  ↓ Events
Kafka Topic (assessment.*)
  ↓ Partition 0, 1, 2, ...
Consumer Groups
  ├─ analytics-group (Analytics Service)
  ├─ grading-group (AI/Grading Service)
  ├─ notification-group (Notification Service)
  └─ search-group (Search Indexer)
```

---

## Rationale

**Why Kafka?**
- **Durability**: Persists events for replay
- **Scalability**: 1M+ events/second
- **Ordering**: Per-partition ordering
- **Multiple Consumers**: Each service processes independently
- **Proven**: Netflix, LinkedIn, Uber, Stripe use Kafka

**Why Not RabbitMQ/SQS?**
- RabbitMQ: Good but less ordering guarantees
- SQS: Works but AWS lock-in, no replay
- Kafka: Best for event streaming + replay

---

## Consequences

### Positive
✅ Decouples services  
✅ Enables event sourcing  
✅ Supports replay/debugging  
✅ Multiple consumers per event  
✅ Scales to high throughput  

### Negative
❌ Operational complexity  
❌ Eventual consistency  
❌ Harder to debug (async)  
❌ Schema evolution challenges  

### Mitigations
- **Schema Registry**: Evolve schemas safely
- **Consumer Groups**: Replay events if needed
- **Monitoring**: Alert on lag, errors
- **Testing**: Integration tests with embedded Kafka

---

## Alternatives

### 1. Point-to-Point (Direct Calls)
```
Pros: Simple, immediate
Cons: Tight coupling, cascading failures
Rejected: Not suitable for event-driven
```

### 2. RabbitMQ
```
Pros: Lightweight, easier ops
Cons: No offset management, poor replay
Rejected: Kafka better for event streaming
```

### 3. AWS SQS/SNS
```
Pros: Managed, no ops
Cons: Limited ordering, vendor lock-in
Rejected: Need ordering + replay
```

---

## Implementation

### Producer
```python
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=['kafka-0:9092', 'kafka-1:9092'],
    value_serializer=lambda v: json.dumps(v).encode()
)

producer.send('assessment.submitted', {
    'event_type': 'assessment.submitted',
    'user_id': 'user_456',
    'timestamp': datetime.utcnow().isoformat()
})
```

### Consumer
```python
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    'assessment.submitted',
    bootstrap_servers=['kafka-0:9092'],
    group_id='grading-group',
    auto_offset_reset='earliest'
)

for message in consumer:
    process_submission(message.value)
```

---

## Related ADRs
- ADR-001: Application Architecture (service decoupling)
- ADR-006: Logging & Telemetry (event tracing)

---

## Approval
- **Approved By**: CTO, Platform Team | **Review Date**: 2027-03-28

