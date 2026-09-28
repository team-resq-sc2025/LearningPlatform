# AI Architecture Instructions

## Repository Architecture

**Type**: Microservices-based SaaS platform for AI-powered learning management

**Core Services**:
- LMS Service (courses, enrollment, progress)
- Assessment Service (exams, submissions)
- User Service (auth, identity, RBAC)
- Analytics Service (dashboards, metrics)
- AI/Grading Service (auto-grading, content generation)
- Notification Service (email, SMS, in-app)
- Content Service (storage, indexing, CDN)
- Integration Service (3rd-party APIs, webhooks)

**Technology Stack**:
- **API**: REST + gRPC
- **LLM Integration**: Claude API (Opus, Sonnet)
- **Backend**: Node.js (LMS, Assessment), Python (AI), Go (Analytics)
- **Database**: PostgreSQL (primary) + TimescaleDB (analytics) + Elasticsearch (search)
- **Cache**: Redis
- **Messaging**: Kafka
- **Storage**: AWS S3
- **Observability**: ELK + Prometheus + Jaeger
- **Deployment**: Kubernetes + Terraform
- **IaC**: Terraform, Helm, ArgoCD

## Key Principles

1. **Loose Coupling**: Services communicate via REST or events, not shared databases
2. **Eventual Consistency**: Use event-driven architecture for cross-service updates
3. **Async First**: Long-running ops use message queue, not synchronous calls
4. **Multi-Tenancy**: Row-level security (RLS) isolates org data
5. **Stateless**: Services don't maintain state; use Redis for sessions
6. **Scalability**: Each service scales independently based on load
7. **Resilience**: Circuit breakers, retries, graceful degradation

## When Making Changes

- **Understand service boundaries**: Which service owns this feature?
- **Check data flow**: Does it require async events or sync API?
- **Multi-tenancy**: Ensure org_id filtering in queries
- **Dependencies**: Review if change affects other services
- **Backward compatibility**: API changes need versioning strategy
- **Documentation**: Update architectural docs if design changes

## Related Documents

- [Documentation/Architecture/02-LOGICAL-ARCHITECTURE.md](../Documentation/Architecture/02-LOGICAL-ARCHITECTURE.md)
- [Documentation/Architecture/01-SYSTEM-CONTEXT-DIAGRAM.md](../Documentation/Architecture/01-SYSTEM-CONTEXT-DIAGRAM.md)
- [Documentation/Architecture/ADR/](../Documentation/Architecture/ADR/)

