# ADR-010: Deployment Strategy (Blue-Green + Canary)

**Status:** ✅ ACCEPTED | **Date:** 2026-09-28

---

## Decision

**Multi-stage deployment with Blue-Green for standard, Canary for risky changes:**

### Blue-Green Deployment (Standard)
```
Blue (Current) ← 100% traffic
  ├─ Services v1.0
  ├─ Database (schema v1)
  └─ Healthy & stable

Green (New) ← 0% traffic
  ├─ Services v1.1 (running tests)
  ├─ Database (replicated from Blue)
  └─ Running integration tests

When Green validates:
  → Switch router: Blue ← 100% traffic → Green
  → Blue becomes standby (rollback target)
```

### Canary Deployment (High-Risk)
```
5% traffic → Green v1.1 (monitor 30 min)
  ↓ (if errors increase > 1%, rollback immediately)
25% traffic → Green v1.1 (monitor 30 min)
  ↓ (if latency increases > 10%, rollback)
100% traffic → Green v1.1 (full deployment)
```

### Deployment Stages
1. **Code Push**: Git push → GitHub
2. **Build**: Docker image, tests, security scan
3. **Staging Deploy**: Test full system in staging
4. **Production Approval**: Manual gate (approval required)
5. **Canary/Blue-Green**: Auto-deployment per strategy
6. **Health Checks**: Validate endpoints responding
7. **Rollback**: Automated if health checks fail

### Rollback Strategy
```
Automatic Rollback (within 5 minutes):
  - Error rate > 1%
  - Latency p95 > 1 second
  - 5xx response rate > 0.5%
  - Health check failures
  
Manual Rollback (operations decision):
  - Unexpected behavior
  - Data corruption
  - Compliance violation
```

---

## Rationale

**Why Blue-Green?**
- Zero downtime (instant switch)
- Fast rollback (just switch back)
- Full test before traffic shift
- Simple to understand

**Why Canary?**
- High-risk changes tested gradually
- Real user traffic validation
- Early detection of problems
- Confidence in changes

**Why Automated Health Checks?**
- Catch problems faster than humans
- Automatic rollback saves time
- Consistent criteria across deployments

---

## Consequences

### Positive
✅ Zero downtime deployments  
✅ Fast rollback capability  
✅ Gradual risk reduction  
✅ Real user feedback before full release  

### Negative
❌ Requires two environments  
❌ More complex than simple deployment  
❌ Database migrations need planning  
❌ Testing infrastructure overhead  

### Mitigations
- **Infrastructure as Code**: Terraform automates env setup
- **CI/CD**: Automates deployment process
- **Monitoring**: Clear health metrics
- **Runbooks**: Clear procedures for failures

---

## Implementation

### Terraform (Blue-Green Setup)
```hcl
resource "aws_alb_target_group" "blue" {
  name = "app-blue"
  # Blue environment
}

resource "aws_alb_target_group" "green" {
  name = "app-green"
  # Green environment
}

# Switch traffic from blue to green
resource "aws_lb_listener" "http" {
  default_target_group_arn = aws_alb_target_group.green.arn
}
```

### Deployment Script
```bash
#!/bin/bash
# 1. Build new image
docker build -t app:v1.1 .

# 2. Deploy to green environment
kubectl apply -f green-deployment.yaml

# 3. Run integration tests
npm run test:integration

# 4. Manual approval
read -p "Approve deployment? (y/n)"

# 5. Switch traffic
kubectl patch svc app -p '{"spec":{"selector":{"version":"green"}}}'

# 6. Monitor
monitor_health_checks 5m

# 7. If fails, rollback
kubectl patch svc app -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  const checks = {
    database: checkDatabase(),
    cache: checkCache(),
    external_api: checkExternalAPI(),
    memory: checkMemory()
  };
  
  const status = Object.values(checks).every(c => c.ok) ? 200 : 503;
  res.status(status).json(checks);
});
```

### Canary with Flagger
```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  progressDeadlineSeconds: 300
  service:
    port: 80
  analysis:
    interval: 1m
    threshold: 3  # 3 failed checks = rollback
    metrics:
    - name: error-rate
      query: |
        sum(rate(http_requests_total{status=~"5.."}[5m])) /
        sum(rate(http_requests_total[5m]))
      thresholdRange:
        max: 0.01  # max 1% errors
    - name: latency
      query: |
        histogram_quantile(0.95,
        sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
      thresholdRange:
        max: 1000  # max 1 second p95
  skipAnalysis: false
  stages:
  - weight: 5
    maxWeight: 10
    stepWeight: 5
```

---

## Release Checklist
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review approved
- [ ] Deployment plan documented
- [ ] Rollback procedure tested
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment
- [ ] Manual approval obtained
- [ ] Health checks passing
- [ ] Canary metrics healthy
- [ ] Production validation complete

---

## Related ADRs
- ADR-001: Application Architecture (service deployment)
- ADR-006: Logging & Telemetry (deployment monitoring)

---

## Approval
- **Approved By**: DevOps Lead, CTO | **Review Date**: 2027-03-28

