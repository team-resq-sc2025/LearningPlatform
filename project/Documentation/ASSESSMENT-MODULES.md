# Assessment Modules - Comprehensive Guide

## Overview

The assessment modules provide a complete end-to-end system for creating, administering, grading, and analyzing assessments within the professional training platform. This includes support for multiple question types, proctoring, automated & manual grading, certificate generation, and advanced analytics.

## Architecture

### Data Models

#### Core Assessment Models
- **Assessment**: Main assessment configuration (quiz, exam, assignment)
- **Question**: Individual questions within an assessment
- **MultipleChoiceOption**: Options for multiple choice questions
- **QuestionBank**: Repository of reusable questions

#### Attempt & Submission Models
- **AssessmentAttempt**: Tracks each learner's attempt at an assessment
- **Answer**: Individual responses to questions
- **Submission**: Aggregated submission record

#### Grading & Evaluation
- **GradingRubric**: Rubric criteria for manual grading
- **RubricCriterion**: Individual grading criteria
- **RubricLevel**: Scoring levels within criteria
- **GradingQueue**: Tracks pending grading work

#### Analytics Models
- **AssessmentAnalytics**: Aggregate statistics
- **QuestionAnalytics**: Per-question psychometric data
- **LearningAnalytics**: Individual learner progress

#### Certification & Credentials
- **Certificate**: Issued certificates
- **CertificateTemplate**: Custom certificate templates

#### Proctoring
- **ProctorSession**: Proctoring session tracking
- **SuspiciousActivity**: Flagged activities during proctoring

### Services

The `AssessmentService` provides comprehensive API integration:

#### Assessment Management
- CRUD operations for assessments
- Publish/archive assessments
- Bulk operations

#### Question Management
- Create, update, delete questions
- Support for 7 question types
- Manage multiple choice options
- Question reordering
- Import from question banks

#### Attempt Management
- Start and submit attempts
- Save answers progressively
- Flag questions for review
- Manage attempt configuration

#### Grading & Evaluation
- Submit for grading
- Grade individual answers
- Apply rubrics
- Provide feedback
- Track grading progress

#### Analytics
- Assessment-level analytics
- Question-level psychometric analysis
- Individual learner analytics
- Generate reports

#### Certificates
- Generate certificates
- Verify credentials
- Manage templates
- Download certificates

#### Proctoring
- Start proctoring sessions
- Record suspicious activities
- End sessions

## Components

### 1. Exam Builder Component

**Path**: `frontend/src/app/components/assessments/exam-builder/`

**Features**:
- Create and edit assessments
- Configure assessment settings
- Manage attempt configuration
- Publish/archive assessments
- View question list
- Tabbed interface for different sections

**Usage**:
```typescript
// Navigate to create new assessment
router.navigate(['/assessments/new']);

// Navigate to edit assessment
router.navigate(['/assessments', assessmentId, 'edit']);
```

**Key Configuration Options**:
- Assessment type (quiz, exam, assignment)
- Pass percentage threshold
- Time limits
- Retake settings
- Question randomization
- Option randomization
- Proctoring options
- Result visibility
- Feedback settings

### 2. Question Manager Component

**Path**: `frontend/src/app/components/assessments/question-manager/`

**Features**:
- Create and edit individual questions
- Support for 7 question types:
  - Multiple Choice
  - True/False
  - Essay
  - Short Answer
  - Matching
  - Code
  - File Upload
- Set difficulty levels
- Add topic tags
- Provide explanations
- Manage multiple choice options
- Mark correct answers
- Reorder options

**Usage**:
```typescript
// Create new question
router.navigate(['/assessments', assessmentId, 'questions', 'new']);

// Edit existing question
router.navigate(['/assessments', assessmentId, 'questions', questionId]);
```

**Question Types**:
- **Multiple Choice**: Traditional MCQ with single correct answer
- **True/False**: Binary choice questions
- **Essay**: Long-form text response
- **Short Answer**: Brief text response
- **Matching**: Match items to options
- **Code**: Programming code submission
- **File Upload**: Upload response file

**Difficulty Levels**:
- Easy
- Medium
- Hard

### 3. Assessment Analytics Component

**Path**: `frontend/src/app/components/assessments/assessment-analytics/`

**Features**:
- Overall assessment statistics
- Pass/fail distribution
- Score range analysis
- Question-level psychometric analysis
- Attempt tracking
- Difficulty and discrimination indices
- Option effectiveness analysis
- Learner performance trends
- Export reports

**Key Metrics**:
- Total attempts
- Average score
- Median score
- Pass rate
- Score range (min/max)
- Standard deviation
- Average time taken
- Difficulty index (% answering correctly)
- Discrimination index (correlation with overall performance)
- Option selection statistics

**Tabs**:
1. **Overview**: Summary statistics and distributions
2. **Question Analysis**: Psychometric data per question
3. **Attempts**: Detailed attempt records

### 4. Grading Component

**Path**: `frontend/src/app/components/assessments/grading/`

**Features**:
- Queue management for pending submissions
- Side-by-side display of student response and grading interface
- Rubric-based grading
- Manual scoring
- Feedback entry
- Progressive answer advancement
- Batch grading workflow
- Progress tracking
- Export grading results

**Workflow**:
1. View list of attempts needing grading
2. Select an attempt
3. Review student response
4. Apply rubric criteria or enter score
5. Add constructive feedback
6. Save and advance to next answer
7. Export results

**Grading Modes**:
- **Rubric-based**: Apply predefined criteria and levels
- **Point-based**: Manual score entry
- **Mixed**: Use rubric with option to adjust points

### 5. Certificate Management

**Features** (in service):
- Auto-generate certificates on passing
- Verify certificates via verification code
- Custom certificate templates
- Digital badge support
- Certificate expiry tracking
- Public verification profiles
- Download certificates

## Question Types in Detail

### 1. Multiple Choice
```typescript
{
  type: 'multiple_choice',
  options: [
    { text: 'Option A', is_correct: true },
    { text: 'Option B', is_correct: false },
    { text: 'Option C', is_correct: false },
    { text: 'Option D', is_correct: false }
  ]
}
```

### 2. True/False
```typescript
{
  type: 'true_false',
  options: [
    { text: 'True', is_correct: true },
    { text: 'False', is_correct: false }
  ]
}
```

### 3. Essay
```typescript
{
  type: 'essay',
  points: 10,
  rubric_id: 'optional-rubric-id'
}
```

### 4. Short Answer
```typescript
{
  type: 'short_answer',
  points: 5,
  expected_keywords: ['keyword1', 'keyword2']
}
```

## Attempt Configuration

Each assessment has configurable attempt settings:

```typescript
{
  max_attempts: 3,
  time_limit_minutes: 60,
  attempt_lock_duration_hours: 24,
  show_results_immediately: true,
  show_correct_answers_after: 'after_submission',
  allow_review: true
}
```

**Options**:
- `show_correct_answers_after`:
  - `never`: Never show
  - `after_submission`: Show after student submits
  - `after_all_attempts`: After all retakes exhausted
  - `after_deadline`: After due date passes

## Analytics Engine

### Psychometric Analysis

**Difficulty Index**:
- Formula: % of test takers answering correctly
- Interpretation:
  - < 0.3: Very difficult
  - 0.3-0.7: Moderate
  - > 0.7: Easy

**Discrimination Index**:
- Formula: Correlation between question performance and overall score
- Interpretation:
  - < 0.1: Poor discrimination
  - 0.1-0.3: Fair discrimination
  - > 0.3: Good discrimination

**Option Analysis**:
- Track which options are selected most
- Identify problematic distractors
- Detect answer key errors

### Learning Analytics

Per-learner analytics include:
- Attempt history and trends
- Score improvement over attempts
- Topic/skill mastery levels
- Estimated competency scores
- Strong and weak areas
- Personalized recommendations

## Grading Rubrics

### Rubric Structure

```typescript
{
  id: 'rubric-1',
  assessment_id: 'assessment-1',
  name: 'Essay Grading Rubric',
  criteria: [
    {
      name: 'Content Accuracy',
      description: 'Correctness of information',
      max_points: 5,
      levels: [
        { level_name: 'Excellent', points: 5, description: 'All accurate' },
        { level_name: 'Good', points: 4, description: 'Mostly accurate' },
        { level_name: 'Fair', points: 3, description: 'Some errors' },
        { level_name: 'Poor', points: 1, description: 'Many errors' }
      ]
    },
    {
      name: 'Clarity & Organization',
      description: 'How well-organized is the response',
      max_points: 5,
      levels: [...]
    }
  ]
}
```

### Using Rubrics

1. Create rubric in Exam Builder
2. Add criteria and scoring levels
3. During grading, evaluators select levels for each criterion
4. Scores automatically calculated from levels
5. Feedback can be added for each criterion

## Question Banks

### Creating a Question Bank

```typescript
{
  course_id: 'course-123',
  name: 'Algebra Fundamentals',
  description: 'Questions for algebra assessment',
  created_by: 'trainer-id'
}
```

### Reusing Questions

1. Create questions in question bank
2. In exam builder, import questions from bank
3. Select specific questions or filter by topic/difficulty
4. Questions copied into assessment

## Proctoring Features

### Supported Proctoring Methods

1. **Browser Lock**: Prevent tab switching
2. **Webcam Monitoring**: Monitor test environment
3. **IP Tracking**: Verify test location
4. **Device Fingerprint**: Detect device changes

### Suspicious Activities Tracked

- Tab switches
- Full-screen exits
- Multiple faces detected
- Face not detected
- Unusual behavior patterns

### Proctor Session Flow

1. Assessment starts → proctor session initiated
2. Monitor suspicious activities throughout attempt
3. Flag issues for review
4. End session when assessment submitted
5. Review flagged activities for integrity issues

## Certificates & Credentials

### Auto-Generation

Certificates automatically generated when:
1. Assessment is passed (score ≥ pass_score)
2. All requirements met
3. Learner completes attempt

### Certificate Contents

- Learner name
- Assessment/course name
- Completion date
- Score/grade
- Certificate number (unique)
- Verification code (QR code compatible)
- Digital signature
- Expiry date (if applicable)

### Certificate Verification

Public verification via:
- Verification code lookup
- QR code scan
- LinkedIn integration (shareable)
- Digital badge format

### Custom Templates

1. Create template with HTML
2. Add placeholders: `{{learner_name}}`, `{{score}}`, `{{date}}`, etc.
3. Apply to assessment
4. Auto-populate on generation

## API Endpoints Summary

```
POST   /api/v1/assessments                          # Create
GET    /api/v1/assessments                          # List
GET    /api/v1/assessments/{id}                     # Get one
PUT    /api/v1/assessments/{id}                     # Update
DELETE /api/v1/assessments/{id}                     # Delete
POST   /api/v1/assessments/{id}/publish             # Publish
POST   /api/v1/assessments/{id}/archive             # Archive

POST   /api/v1/assessments/{id}/questions           # Create question
GET    /api/v1/assessments/{id}/questions           # List questions
GET    /api/v1/assessments/{id}/questions/{qid}     # Get question
PUT    /api/v1/assessments/{id}/questions/{qid}     # Update question
DELETE /api/v1/assessments/{id}/questions/{qid}     # Delete question

POST   /api/v1/assessments/{id}/attempts            # Start attempt
GET    /api/v1/assessments/{id}/attempts            # List attempts
GET    /api/v1/assessments/{id}/attempts/{aid}      # Get attempt
POST   /api/v1/assessments/{id}/attempts/{aid}/submit  # Submit attempt

POST   /api/v1/assessments/{id}/attempts/{aid}/answers/{qid}  # Save answer
GET    /api/v1/assessments/{id}/attempts/{aid}/answers        # Get answers

GET    /api/v1/assessments/{id}/submissions          # List submissions
POST   /api/v1/assessments/{id}/submissions/{sid}/grade  # Grade

GET    /api/v1/assessments/{id}/analytics           # Assessment analytics
GET    /api/v1/assessments/{id}/questions/{qid}/analytics  # Question analytics

GET    /api/v1/certificates/{id}                   # Get certificate
GET    /api/v1/certificates/verify/{code}          # Verify certificate
POST   /api/v1/certificates                        # Generate certificate

GET    /api/v1/question-banks                      # List banks
POST   /api/v1/question-banks                      # Create bank
GET    /api/v1/question-banks/{id}                 # Get bank
```

## Security Considerations

1. **Question Bank Access**: Control who can view/edit question banks
2. **Assessment Visibility**: Limit assessment preview to authorized users
3. **Attempt Security**: Prevent multiple simultaneous attempts
4. **Answer Integrity**: Log all answer changes
5. **Grading Audit Trail**: Track who graded and when
6. **Certificate Verification**: Verify ownership before showing details
7. **Proctoring Data**: Encrypt and secure webcam/session recordings

## Performance Optimization

1. **Question Banks**: Cache frequently accessed questions
2. **Analytics**: Pre-compute aggregate statistics
3. **Grading Queue**: Paginate submissions
4. **Proctoring**: Stream activities asynchronously
5. **Certificates**: Generate asynchronously for bulk operations

## Future Enhancements

- AI-powered essay grading
- Automated question generation from content
- Adaptive testing (difficulty adjustment)
- Peer grading workflows
- Advanced proctoring with face recognition
- Machine learning for content recommendations
- Integration with external assessment platforms
- Blockchain-based credential verification
- Mobile app support
- Advanced learner behavior analytics

## Troubleshooting

### Question not saving
- Verify question text is not empty
- Check that points > 0
- For MCQ, ensure at least one option is marked correct

### Attempt won't start
- Verify assessment is published
- Check learner hasn't exhausted max attempts
- Confirm no active attempt in progress

### Grades not calculating
- Verify rubric is properly configured
- Check answer type matches question type
- Confirm scoring rules are defined

### Analytics showing zero
- Ensure assessments have been attempted
- Verify answers have been submitted
- Check time range filters
- Confirm queries are not filtering out data

## Support & Documentation

For additional help:
- Check the Assessment Modules README
- Review component templates for examples
- Consult API documentation
- Review commercial-training-app-guide.html for business context
