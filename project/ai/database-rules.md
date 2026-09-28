# AI Database Rules Instructions

## Database Technology Selection

- **PostgreSQL**: Primary database (OLTP, ACID)
- **TimescaleDB**: Time-series analytics
- **Elasticsearch**: Full-text search
- **Redis**: Cache and sessions
- **S3**: Object storage (files, backups)

**Never mix databases**: Don't store course data in Elasticsearch or session data in PostgreSQL.

## PostgreSQL Best Practices

### Naming Conventions
- **Tables**: snake_case, plural (courses, users, assessments)
- **Columns**: snake_case (user_id, created_at, is_active)
- **Indexes**: idx_{table}_{columns} (idx_users_email, idx_enrollments_user_course)
- **Foreign Keys**: fk_{source_table}_{target_table}

### Queries

#### ✅ DO Use Parameterized Queries
```sql
-- ✅ Safe (parameterized)
SELECT * FROM courses WHERE id = $1 AND org_id = $2
-- Parameters: [courseId, orgId]

-- ✅ ORM/TypeORM (safe)
const course = await Course.findOne({ where: { id, orgId } });
```

#### ❌ DO NOT Use String Concatenation
```sql
-- ❌ NEVER (SQL injection vulnerable)
SELECT * FROM courses WHERE id = '${courseId}'

-- ❌ NEVER
`SELECT * FROM courses WHERE id = ${courseId}`
```

### Multi-Tenancy

```sql
-- ✅ ALWAYS filter by org_id
SELECT * FROM courses 
WHERE org_id = $1 AND id = $2;

-- ✅ Create RLS policies
CREATE POLICY course_isolation ON courses
  USING (org_id = current_setting('tenant.org_id')::uuid);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
```

### Indexes

```sql
-- ✅ Index frequently filtered columns
CREATE INDEX idx_courses_org_status ON courses(org_id, status);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);

-- ✅ Index foreign keys
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- ✅ Full-text search
CREATE INDEX idx_courses_content_gin ON courses USING GIN(to_tsvector('english', title || ' ' || description));
```

### Transactions

```typescript
// ✅ Use transactions for atomic operations
await db.transaction(async (trx) => {
  // Deduct from account
  await trx('accounts').update({ balance: raw('balance - ?', [amount]) }).where({ id: accountId });
  
  // Record transaction
  await trx('transactions').insert({ accountId, amount, type: 'debit' });
  
  // Both succeed or both fail
});
```

### Migrations

```sql
-- ✅ Version control migrations
-- Migration: 001_create_courses_table.sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_org_id ON courses(org_id);

-- Always include rollback
-- Rollback: DROP TABLE courses;
```

## Avoiding Common Mistakes

#### ❌ N+1 Query Problem
```typescript
// NEVER: N+1 queries
const courses = await Course.find({ orgId });
for (const course of courses) {
  // This queries DB for every course!
  course.assessments = await Assessment.find({ courseId: course.id });
}

// ✅ ALWAYS: Eager load
const courses = await Course.find({ orgId }, { relations: ['assessments'] });
```

#### ❌ Missing Indexes
```sql
-- ❌ SLOW (no index on frequently filtered column)
SELECT * FROM submissions WHERE user_id = $1;  -- Full table scan!

-- ✅ FAST (with index)
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
```

#### ❌ Unbound Queries
```typescript
// ❌ Returns ALL rows (could be millions)
const allSubmissions = await Submission.find({ status: 'pending' });

// ✅ Always paginate
const submissions = await Submission.find(
  { status: 'pending' },
  { skip: (page - 1) * pageSize, take: pageSize }
);
```

## Data Retention

```
Users: Indefinite
Courses: Indefinite
Enrollments: 2 years
Submissions: 7 years (compliance)
Audit logs: 7 years
Session logs: 90 days
```

## Backups

```
Frequency: Daily incremental, weekly full
Retention: 30 days hot, 1 year warm, 7 years cold
Testing: Quarterly restore test
Location: Geo-redundant (cross-region)
```

## Database Checklist

- [ ] Parameterized queries (no SQL injection)
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently filtered columns
- [ ] RLS policies for multi-tenancy
- [ ] Transactions for atomic operations
- [ ] Migration files versioned
- [ ] Rollback scripts included
- [ ] No N+1 queries
- [ ] Queries paginated
- [ ] Encryption for sensitive columns
- [ ] Audit logging for sensitive data
- [ ] Backups tested

