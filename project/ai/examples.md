# AI Code Examples & Patterns

## Service Implementation Pattern

```typescript
// src/services/course.service.ts

import { Logger } from 'pino';
import { CourseRepository } from '../repositories/course.repository';
import { CourseNotFoundError, ValidationError } from '../errors';

export class CourseService {
  constructor(
    private logger: Logger,
    private courseRepo: CourseRepository
  ) {}

  async getCourse(courseId: string, orgId: string) {
    this.logger.info('Fetching course', { courseId, orgId });
    
    const course = await this.courseRepo.findOne(courseId, orgId);
    
    if (!course) {
      this.logger.warn('Course not found', { courseId, orgId });
      throw new CourseNotFoundError(`Course ${courseId} not found`);
    }
    
    return course;
  }

  async createCourse(data: CreateCourseDto, orgId: string) {
    // Validate input
    if (!data.title || !data.title.trim()) {
      throw new ValidationError('Title is required');
    }
    
    // Create course
    const course = await this.courseRepo.create({
      ...data,
      orgId,
      createdBy: data.userId
    });
    
    this.logger.info('Course created', { courseId: course.id, orgId });
    return course;
  }
}
```

## Controller Pattern

```typescript
// src/controllers/course.controller.ts

export class CourseController {
  constructor(
    private logger: Logger,
    private courseService: CourseService
  ) {}

  async get(req: Request, res: Response) {
    const traceId = req.headers['x-trace-id'];
    const { id } = req.params;
    const orgId = req.user.orgId;
    
    try {
      this.logger.info('GET /courses/:id', { traceId, courseId: id });
      const course = await this.courseService.getCourse(id, orgId);
      res.json({ data: course });
    } catch (error) {
      this.handleError(error, res, traceId);
    }
  }

  private handleError(error: Error, res: Response, traceId: string) {
    this.logger.error('Request failed', {
      traceId,
      error: error.message,
      type: error.constructor.name
    });
    
    if (error instanceof CourseNotFoundError) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          traceId
        }
      });
    }
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        traceId
      }
    });
  }
}
```

## Repository Pattern

```typescript
// src/repositories/course.repository.ts

export class CourseRepository {
  constructor(private db: Database) {}

  async findOne(id: string, orgId: string): Promise<Course | null> {
    return this.db.query(
      'SELECT * FROM courses WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );
  }

  async create(data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> {
    return this.db.query(
      `INSERT INTO courses (org_id, title, description, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [data.orgId, data.title, data.description, data.createdBy]
    );
  }

  async listByOrg(orgId: string, page = 1, pageSize = 25): Promise<Course[]> {
    const offset = (page - 1) * pageSize;
    return this.db.query(
      `SELECT * FROM courses 
       WHERE org_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [orgId, pageSize, offset]
    );
  }
}
```

## Unit Test Pattern

```typescript
// src/services/course.service.test.ts

describe('CourseService', () => {
  let service: CourseService;
  let mockRepo: jest.Mocked<CourseRepository>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRepo = jest.createMockFromModule('../repositories/course.repository');
    mockLogger = jest.createMockFromModule('pino');
    service = new CourseService(mockLogger, mockRepo);
  });

  describe('getCourse', () => {
    it('should return course when found', async () => {
      // Arrange
      const course = { id: '1', title: 'Python', orgId: 'org_1' };
      mockRepo.findOne.mockResolvedValue(course);

      // Act
      const result = await service.getCourse('1', 'org_1');

      // Assert
      expect(result).toEqual(course);
      expect(mockRepo.findOne).toHaveBeenCalledWith('1', 'org_1');
    });

    it('should throw NotFoundError when course not found', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCourse('999', 'org_1'))
        .rejects.toThrow(CourseNotFoundError);
    });
  });

  describe('createCourse', () => {
    it('should validate title is required', async () => {
      const data = { title: '', description: 'Test' };

      await expect(service.createCourse(data, 'org_1'))
        .rejects.toThrow(ValidationError);
    });

    it('should create course with org isolation', async () => {
      const data = { title: 'Python', description: 'Learn Python', userId: 'user_1' };
      const course = { id: '1', ...data, orgId: 'org_1', createdAt: new Date() };
      mockRepo.create.mockResolvedValue(course);

      const result = await service.createCourse(data, 'org_1');

      expect(result).toEqual(course);
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        orgId: 'org_1'
      }));
    });
  });
});
```

## Integration Test Pattern

```typescript
// src/services/course.service.integration.test.ts

describe('CourseService (Integration)', () => {
  let service: CourseService;
  let db: Database;

  beforeAll(async () => {
    db = new Database('postgresql://localhost/test_db');
    await db.migrate();
  });

  beforeEach(async () => {
    await db.transaction(async (trx) => {
      service = new CourseService(logger, new CourseRepository(trx));
    });
  });

  afterAll(async () => {
    await db.close();
  });

  it('should create and retrieve course', async () => {
    await db.transaction(async (trx) => {
      // Create
      const created = await service.createCourse({
        title: 'Python',
        description: 'Learn Python',
        userId: 'user_1'
      }, 'org_1');

      // Retrieve
      const retrieved = await service.getCourse(created.id, 'org_1');

      expect(retrieved.title).toBe('Python');
    });
  });

  it('should enforce org isolation', async () => {
    await db.transaction(async (trx) => {
      const created = await service.createCourse({...}, 'org_1');

      // Should not find course from different org
      const result = await service.getCourse(created.id, 'org_2');
      expect(result).toBeNull();
    });
  });
});
```

## API Endpoint Pattern

```typescript
// routes/courses.ts

router.get(
  '/v1/courses/:id',
  authenticate(),
  async (req, res, next) => {
    try {
      const course = await courseService.getCourse(
        req.params.id,
        req.user.orgId
      );
      res.json({ data: course });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/v1/courses',
  authenticate(),
  authorize('create:courses'),
  validateBody(createCourseSchema),
  async (req, res, next) => {
    try {
      const course = await courseService.createCourse(
        req.body,
        req.user.orgId
      );
      res.status(201).json({ data: course });
    } catch (error) {
      next(error);
    }
  }
);
```

## Error Handling Pattern

```typescript
// src/errors/index.ts

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', 400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', 404, message);
  }
}

// Middleware
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        traceId: req.headers['x-trace-id']
      }
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      traceId: req.headers['x-trace-id']
    }
  });
});
```

## Async Event Pattern

```typescript
// src/events/course.events.ts

export class CourseEventPublisher {
  async publishCourseCreated(course: Course, publishedBy: string) {
    await this.kafka.publish('course.created', {
      courseId: course.id,
      orgId: course.orgId,
      title: course.title,
      publishedBy,
      timestamp: new Date()
    });
  }
}

// Consumer
const consumer = kafka.consumer({ groupId: 'analytics-service' });
await consumer.subscribe({ topic: 'course.created' });

await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value);
    await analyticsService.recordCourseCreated(event);
  }
});
```

## Configuration Pattern

```typescript
// src/config/index.ts

export const config = {
  // From environment variables
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10')
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET, // From secrets manager
    expiresIn: '1h'
  },
  log: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
```

## Security Pattern

```typescript
// Middleware: Input validation
const validateBody = (schema: z.ZodSchema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Middleware: Rate limiting
const rateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // limit each IP to 100 requests
});

app.post('/v1/auth/login', rateLimit, (req, res) => { ... });
```

