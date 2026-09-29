# Prompt Engineering Assignments for Training Platform

## 1. ZERO-SHOT PROMPTING
*Asking AI to complete tasks without examples or prior context*

### Assignment 1.1: Course Content Generation
**Task**: Generate course outline for a new topic without any examples
```
Generate a comprehensive course outline for "Introduction to Cloud Computing" 
with 5 modules, each containing 3-4 lessons. Include learning outcomes for each module.
Format as a structured list.
```

**Expected Output**: 
- 5 well-organized modules
- 15-20 lessons total
- Clear learning outcomes
- Logical progression

### Assignment 1.2: Assessment Question Generation
**Task**: Create an assessment question without showing examples
```
Create a multiple-choice question that assesses understanding of "REST API principles".
The question should have:
- Clear stem
- 4 options (1 correct, 3 plausible distractors)
- Explanation of the correct answer
```

**Expected Output**:
- Well-formed MCQ
- Appropriate difficulty
- Educational value
- Clear explanation

### Assignment 1.3: Quiz Difficulty Classification
**Task**: Classify question difficulty without examples
```
Classify the following question as "Easy", "Medium", or "Hard" and explain your reasoning:
"What is the primary difference between SQL and NoSQL databases?"

Provide:
1. Difficulty level
2. Reason for classification
3. Target learner level (Beginner/Intermediate/Advanced)
```

**Expected Output**:
- Clear classification
- Justified reasoning
- Target audience identification

---

## 2. FEW-SHOT PROMPTING
*Providing examples before asking for the desired output*

### Assignment 2.1: Prompt Engineering Course Topics
**Task**: Generate course topics using examples
```
Here are examples of well-structured course topics:

Example 1:
- Topic: Python Functions
- Level: Beginner
- Duration: 4 hours
- Prerequisites: Variables and Data Types
- Key Concepts: Definition, Parameters, Return values, Scope

Example 2:
- Topic: Database Normalization
- Level: Intermediate
- Duration: 6 hours
- Prerequisites: SQL Basics, Relational Models
- Key Concepts: Normal forms, Dependencies, Schema design

Now generate a similar topic structure for: "API Authentication and Security"
Include all the same fields, appropriate for Advanced level.
```

**Expected Output**:
- Well-structured topic following examples
- Appropriate difficulty level
- Realistic time estimates
- Clear prerequisites

### Assignment 2.2: Assessment Rubric Creation
**Task**: Create grading rubrics using examples
```
Example 1 - Essay Rubric:
Criteria: Content Accuracy (4 points)
- Excellent (4): All facts accurate and well-supported
- Good (3): Mostly accurate with minor errors
- Fair (2): Some errors but core concepts present
- Poor (1): Multiple errors or missing concepts

Example 2 - Essay Rubric:
Criteria: Organization (4 points)
- Excellent (4): Clear structure, logical flow
- Good (3): Generally organized with minor issues
- Fair (2): Basic organization but some confusion
- Poor (1): Disorganized, hard to follow

Now create a similar rubric for evaluating "Code Quality" with 5 points maximum.
```

**Expected Output**:
- Clear criteria definition
- 4-5 distinct levels
- Point values
- Specific descriptors for each level

### Assignment 2.3: Learning Recommendation Logic
**Task**: Generate recommendations using examples
```
Example 1:
Student Profile: Completed Python Basics, interested in Data Science, 
learning pace: Fast, available hours: 10/week
Recommendation: Advance to Python Data Analysis course

Example 2:
Student Profile: Completed SQL Basics, interested in Web Development, 
learning pace: Slow, available hours: 5/week
Recommendation: Take Frontend HTML/CSS course before Backend SQL optimization

Now recommend learning path for:
Student Profile: Completed JavaScript Basics, Web Design, interested in Full Stack,
learning pace: Moderate, available hours: 8/week
```

**Expected Output**:
- Specific course recommendations
- Reasoning for recommendations
- Realistic timeline
- Next steps

---

## 3. CHAIN-OF-THOUGHT PROMPTING
*Asking model to explain reasoning step by step*

### Assignment 3.1: Complex Problem Solving
**Task**: Solve problem with step-by-step reasoning
```
A learner completes Module 1 of a course (100%), Module 2 (75%), and Module 3 (50%).
The passing score is 70%.

Question: Is this learner ready to take the final assessment?

Please think through this step-by-step:
1. What is the overall course completion percentage?
2. What does each module score indicate?
3. What are the risks of progression?
4. What recommendation would you make?
```

**Expected Output**:
- Calculation of aggregate scores
- Analysis of each module
- Risk assessment
- Clear recommendation with reasoning

### Assignment 3.2: Curriculum Design Decision
**Task**: Design curriculum with reasoning chain
```
Design a learning path for "Data Science" considering:
- Prerequisite skills needed
- Logical sequence of topics
- Complexity progression
- Time commitment per learner type

Please explain:
1. Why these prerequisites are needed
2. How topics build on each other
3. Why this specific ordering
4. How different learner types would progress
```

**Expected Output**:
- Clear prerequisite chain
- Justified topic ordering
- Progression logic
- Adaptability for different learners

### Assignment 3.3: Assessment Alignment
**Task**: Align assessments with outcomes using reasoning
```
Learning Outcome: "Students will be able to design a normalized database schema"

Create assessment questions that measure this outcome.

Explain:
1. Why each question type is appropriate
2. How difficulty matches the outcome
3. What skills are being measured
4. How grading ensures fairness
```

**Expected Output**:
- Multiple question types
- Clear alignment to outcomes
- Justified difficulty levels
- Fair grading criteria

---

## 4. ROLE-BASED PROMPTING
*Assigning a specific role/persona to the model*

### Assignment 4.1: Expert Instructor Role
**Task**: Respond as experienced instructor
```
You are an experienced instructor with 15 years of teaching experience in Data Science.

A struggling student has completed the Machine Learning module with a 55% score.
They report feeling overwhelmed by mathematical concepts.

As this instructor, provide:
1. Your assessment of the situation
2. Specific feedback on their performance
3. Recommended interventions
4. Motivational guidance
```

**Expected Output**:
- Empathetic but honest feedback
- Specific improvement suggestions
- Practical interventions
- Encouragement from experienced perspective

### Assignment 4.2: Curriculum Designer Role
**Task**: Design course as expert curriculum specialist
```
You are a curriculum design expert specializing in online education.

Design a 6-week "Introduction to Python" course for complete beginners.

Include:
1. Weekly topics and learning objectives
2. Recommended instructional strategies
3. Assessment methods for each week
4. How to maintain engagement
```

**Expected Output**:
- Professionally structured course
- Evidence-based pedagogical approaches
- Varied assessment methods
- Engagement strategies

### Assignment 4.3: Learner Support Specialist Role
**Task**: Support learners as professional counselor
```
You are a professional learner support specialist helping adult learners.

Three learners are struggling:
- Learner A: Overwhelmed, taking on too much
- Learner B: Unmotivated, unclear about goals
- Learner C: Struggling with technical barriers

For each, provide:
1. Initial response
2. Root cause analysis
3. Personalized support plan
4. Resources and referrals
```

**Expected Output**:
- Empathetic responses
- Personalized solutions
- Clear support plans
- Practical resources

---

## 5. INSTRUCTION-FOLLOWING PROMPTING
*Providing explicit, structured instructions*

### Assignment 5.1: Course Structure with Detailed Instructions
**Task**: Follow strict format for course creation
```
Create a course following EXACTLY these specifications:

Format:
COURSE NAME: [exact format]
DURATION: [hours only, number format]
LEVEL: [ONLY: Beginner, Intermediate, Advanced]
MODULES: [exactly 4]

For each module use:
MODULE [NUMBER]: [Name]
DURATION: [hours]
LESSONS: [list 3-4 lessons]
OUTCOMES: [2-3 bullet points]

Topic: Web Development Fundamentals

Follow this format precisely. Do not deviate.
```

**Expected Output**:
- Exact compliance with format
- No additional information
- Clean, parseable structure
- All required fields

### Assignment 5.2: Question Bank with Specifications
**Task**: Generate questions following exact specifications
```
Generate 5 multiple-choice questions following THESE rules:

1. Topic: Python Loops
2. Difficulty: Intermediate
3. For each question:
   - Stem: 20-30 words, single concept
   - Options: Exactly 4 options
   - One correct answer marked with [CORRECT]
   - Three plausible distractors
   - Explanation: 2-3 sentences

Do not include numbering. Separate questions with ---

Output format:
STEM: [question]
OPTION A: [choice]
OPTION B: [choice]
OPTION C: [choice]
OPTION D: [choice]
CORRECT ANSWER: [letter]
EXPLANATION: [explanation]
---
```

**Expected Output**:
- Exactly 5 questions
- Perfect compliance with format
- Clear structure
- Proper specifications met

### Assignment 5.3: Structured Feedback Template
**Task**: Generate feedback using required structure
```
Generate feedback for a learner submission following this structure:

STUDENT NAME: [name from submission]
ASSIGNMENT: [assignment name]
SCORE: [numeric score]

STRENGTHS:
- [Specific strength 1]
- [Specific strength 2]
- [Specific strength 3]

AREAS FOR IMPROVEMENT:
- [Specific area 1]
- [Specific area 2]

ACTION ITEMS:
1. [Actionable item 1]
2. [Actionable item 2]

ENCOURAGEMENT: [1 sentence]

Student submitted: "A comprehensive essay on machine learning applications"

Follow the structure EXACTLY as shown.
```

**Expected Output**:
- Exact format compliance
- Balanced feedback
- Actionable items
- Clear structure

---

## 6. QUESTION-ANSWERING PROMPTING
*Designing specific questions to get desired information*

### Assignment 6.1: Assessment Gap Analysis
**Task**: Identify gaps through targeted questions
```
Answer these specific questions about the learner's assessment performance:

1. What specific concepts does the learner demonstrate mastery of?
2. In which areas did the learner show confusion?
3. What prerequisite knowledge appears to be missing?
4. What misconceptions might the learner have?
5. What is the appropriate next learning objective?

Learner's responses to assessment on "Network Protocols":
- Q1 (OSI Model): Correctly identified 6 of 7 layers
- Q2 (TCP vs UDP): Confused on connection vs connectionless
- Q3 (Packet Structure): Could not identify fields
- Q4 (IP Addresses): Correctly classified as private/public
- Q5 (DNS): Provided partial explanation

Answer each question specifically.
```

**Expected Output**:
- Specific identified strengths
- Clear gap identification
- Prerequisite analysis
- Misconception detection
- Targeted next steps

### Assignment 6.2: Learner Profile Development
**Task**: Build profile through strategic questions
```
Develop a learner profile by answering:

1. What is the learner's current skill level?
2. What are their demonstrated learning preferences?
3. What pace of learning suits them best?
4. Where do they need most support?
5. What are their strength areas to build upon?
6. What career/learning goals are evident?

Learner data:
- Completed 3 courses: Python (95%), Web Design (88%), Database (65%)
- Prefers video content over text
- Takes 2-3 weeks per module (moderate pace)
- Struggles with theory, excels at projects
- Wants to become full-stack developer

Answer each question with specific details.
```

**Expected Output**:
- Clear skill assessment
- Learning style identification
- Appropriate pacing recommendation
- Support needs identified
- Clear goals extraction

### Assignment 6.3: Course Effectiveness Evaluation
**Task**: Evaluate course through specific questions
```
Evaluate course effectiveness by answering:

1. Are learning outcomes being met?
2. What is the student completion rate indicating?
3. Are assessment methods appropriate?
4. What content might need revision?
5. How engaging is the course?
6. What improvements are most needed?

Course data:
- Enrollment: 150 students
- Completion: 78%
- Average score: 82%
- Drop-off point: Module 3 (23% drop)
- Feedback: "Theory heavy, not enough practice"
- Time per module: 8 hours (planned: 6 hours)

Answer each question based on data.
```

**Expected Output**:
- Data-driven effectiveness assessment
- Specific problem identification
- Root cause analysis
- Prioritized improvements

---

## 7. SUMMARIZATION PROMPTING
*Condensing information into key points*

### Assignment 7.1: Course Summary Generation
**Task**: Summarize full course into key points
```
Summarize this course into a 2-minute reading time summary:

Include:
1. What the course teaches (50 words max)
2. Key skills gained (3-4 bullet points)
3. Who should take it (25 words max)
4. Time commitment (exact hours)
5. Prerequisites (3-4 items)
6. Main topics (5-7 items)

Full course description:
"Advanced Python for Data Science is a comprehensive 40-hour course designed for 
intermediate Python developers looking to specialize in data analysis and machine learning. 
The course covers pandas, NumPy, scikit-learn, data visualization, statistical analysis, 
and real-world project implementation. Students will learn to clean, analyze, and visualize 
large datasets, build predictive models, and present findings to stakeholders. The course 
includes 8 modules, 24 video lessons, 12 hands-on projects, and weekly assignments..."

Keep summary concise and scannable.
```

**Expected Output**:
- Concise overview
- Clear structure
- Scannable format
- Key information highlighted

### Assignment 7.2: Student Performance Summary
**Task**: Summarize student progress
```
Summarize this student's performance into a brief report:

Format:
OVERALL PROGRESS: [%]
STATUS: [Struggling/On Track/Excelling]

STRENGTHS:
- [Strength]
- [Strength]

CHALLENGES:
- [Challenge]
- [Challenge]

RECOMMENDATION:
[One clear recommendation]

Student Data:
- Course completion: 65%
- Module scores: 88%, 75%, 62%, 45%
- Quiz average: 71%
- Assignment completion: 80%
- Time spent: Below average
- Engagement: Declining
- Last activity: 5 days ago

Make it concise for supervisor review.
```

**Expected Output**:
- Clear performance picture
- Quick status assessment
- Actionable recommendation
- Compact format

### Assignment 7.3: Learning Path Summary
**Task**: Summarize complex learning path
```
Summarize this learning path for a prospective learner:

TITLE: [concise title]
DURATION: [total hours]
DIFFICULTY: [level]

WHAT YOU'LL LEARN:
- [Skill 1]
- [Skill 2]
- [Skill 3]

JOURNEY:
Stage 1: [Topic 1] → Stage 2: [Topic 2] → Stage 3: [Topic 3]

TIME PER WEEK: [hours] | [weeks]
BEST FOR: [target learner profile]

Full path details:
- Foundations (Python, SQL, Data Basics): 20 hours
- Analytics Tools (Pandas, NumPy, Visualization): 25 hours
- Machine Learning (Models, Deployment): 30 hours
- Capstone Project: 15 hours
- Total: 90 hours over 12 weeks

Create compelling but accurate summary.
```

**Expected Output**:
- Clear, compelling overview
- Journey visualization
- Time expectations
- Target audience clarity

---

## 8. CONTENT GENERATION PROMPTING
*Creating new educational content*

### Assignment 8.1: Interactive Lesson Script
**Task**: Generate lesson script with interactivity
```
Create an interactive lesson script on "Variables in Python" with:

1. HOOK (1-2 minutes): Engaging opening
2. CONCEPT EXPLANATION (3-5 minutes): Clear explanation
3. INTERACTIVE ELEMENT (2-3 min): Ask learner a question
4. EXAMPLE CODE: 2-3 practical examples
5. PRACTICE EXERCISE: Hands-on activity
6. SUMMARY (1 minute): Key takeaways

Format as dialogue with [INSTRUCTOR] and [LEARNER] parts.
Include pauses for reflection [PAUSE].

Ensure progression from simple to complex.
Make it suitable for beginner learners (15-25 years old).
```

**Expected Output**:
- Engaging script
- Clear structure
- Appropriate difficulty
- Interactive elements
- Practice opportunities

### Assignment 8.2: Case Study Development
**Task**: Generate educational case study
```
Create a real-world case study for teaching "Data Privacy and GDPR":

Include:
1. SCENARIO: Description of a company/situation
2. THE PROBLEM: Privacy/compliance issue they face
3. THE CHALLENGE: Specific questions to consider
4. LEARNING QUESTIONS:
   - Question 1 (Understanding)
   - Question 2 (Application)
   - Question 3 (Analysis)
5. DISCUSSION POINTS: 3-4 key discussion items
6. SOLUTION OVERVIEW: How privacy should be handled

Make it realistic, current, and suitable for intermediate learners.
Include actual regulatory considerations.
```

**Expected Output**:
- Realistic scenario
- Clear learning objectives
- Practical application focus
- Discussion-worthy elements
- Regulatory accuracy

### Assignment 8.3: Infographic Text Generation
**Task**: Generate text for visual learning material
```
Create text content for an infographic on "The Learning Process".

Provide for each of these visual sections:

1. TITLE: [Catchy, clear]
2. MAIN CONCEPT: [1-2 sentence explanation]

SECTION 1 - ATTENTION
- Label: [single word]
- Explanation: [15-20 words]
- Icon description: [what to show]

SECTION 2 - COMPREHENSION
- Label: [single word]
- Explanation: [15-20 words]
- Icon description: [what to show]

SECTION 3 - APPLICATION
- Label: [single word]
- Explanation: [15-20 words]
- Icon description: [what to show]

KEY TAKEAWAY: [10-15 words]

Make text concise but educational.
Keep reading level simple (high school).
```

**Expected Output**:
- Concise, visual-ready text
- Clear labels
- Icon-friendly descriptions
- Educational value
- Appropriate reading level

---

## 9. CLASSIFICATION PROMPTING
*Categorizing content into predefined categories*

### Assignment 9.1: Question Classification
**Task**: Classify questions into taxonomy levels
```
Classify each question by Bloom's Taxonomy level:
- Remember (recall facts)
- Understand (explain concepts)
- Apply (use in new situations)
- Analyze (break down and examine)
- Evaluate (make judgments)
- Create (put elements together)

Questions to classify:
1. "What is photosynthesis?"
2. "Why do plants photosynthesize in sunlight?"
3. "How could plants adapt photosynthesis to Mars?"
4. "How is photosynthesis different from respiration?"
5. "Design an experiment to measure photosynthesis rates"

For each question:
- Identify the level
- Explain your reasoning (1-2 sentences)
- Suggest how to increase difficulty (if applicable)
```

**Expected Output**:
- Clear taxonomy classification
- Justified reasoning
- Difficulty progression options
- Teaching insights

### Assignment 9.2: Course Content Classification
**Task**: Categorize learning materials
```
Classify the following course materials by type and difficulty:

TYPES:
- Conceptual (theory/principles)
- Procedural (how-to/steps)
- Declarative (facts/definitions)
- Metacognitive (thinking about thinking)

DIFFICULTY:
- Foundational (basic, prerequisite)
- Intermediate (building on basics)
- Advanced (synthesis/application)

Content to classify:
1. "Explanation of relational database normalization"
2. "SQL query optimization performance tips"
3. "Practice: Write a query for employee records"
4. "How to debug SQL queries step-by-step"
5. "Database indexing strategies comparison"

For each:
- Type
- Difficulty level
- Reasoning
- Best placement in course
```

**Expected Output**:
- Multiple classification dimensions
- Clear reasoning
- Course structure insights
- Pedagogical grounding

### Assignment 9.3: Learner Need Classification
**Task**: Classify learner issues and needs
```
Classify these learner situations and identify appropriate support:

ISSUE TYPES:
- Foundational gap (missing prerequisites)
- Conceptual confusion (misunderstanding)
- Skill practice (needs more practice)
- Motivation/engagement (not motivated)
- Technical barrier (technical difficulty)
- Pacing issue (too fast/slow)

Learner situations:
1. Student scored 45% on Module 2, previous module was 92%
2. Student hasn't logged in for 2 weeks despite strong progress
3. Student completes assignments late but with high quality
4. Student asks "Why do I need to learn this?" repeatedly
5. Student submits code with syntax errors consistently

For each:
- Primary issue type
- Secondary considerations
- Recommended intervention
- Expected outcome
```

**Expected Output**:
- Accurate issue classification
- Nuanced understanding
- Specific interventions
- Realistic expectations

---

## 10. INFORMATION EXTRACTION PROMPTING
*Pulling specific data from larger content*

### Assignment 10.1: Learning Outcome Extraction
**Task**: Extract and organize learning outcomes
```
Extract all learning outcomes from this course description and organize them:

From: Advanced Web Development Course

Extract and format as:

COGNITIVE LEVEL: [from Bloom's]
OUTCOME: [the outcome]
MEASURABLE BY: [how to assess]

Course text:
"This course teaches students to build responsive websites using HTML5, CSS3, 
and JavaScript frameworks. Students will understand web architecture, 
learn to implement dynamic features, and be able to optimize performance. 
By the end, students can deploy applications to production, manage version control, 
and work in agile teams..."

Organize by:
1. Knowledge outcomes
2. Skill outcomes
3. Competency outcomes

Format each for assessment design use.
```

**Expected Output**:
- Organized outcomes
- Clear cognitive levels
- Measurable criteria
- Assessment-aligned
- Well-structured list

### Assignment 10.2: Prerequisite Identification
**Task**: Extract prerequisites from course requirements
```
Extract all prerequisites and organize by level:

From this course description, identify:
- Absolute prerequisites (must have)
- Recommended prerequisites (helpful)
- Assumed knowledge (not taught but used)

Format for each:
- Prerequisite: [item]
- Level required: [Beginner/Intermediate/Advanced]
- Where typically learned: [course/experience]
- Importance: [critical/important/helpful]

Course description:
"Machine Learning Fundamentals builds on statistics and programming knowledge. 
Students should be comfortable with Python, understand probability and distributions, 
know linear algebra basics, and have used SQL for data queries. Some familiarity 
with data science tools like Jupyter notebooks is helpful but not required. 
Knowledge of calculus is useful but can be learned concurrently..."

Create a prerequisite roadmap for prospective students.
```

**Expected Output**:
- Clear prerequisite levels
- Learning pathway
- Assessment guidance
- Student preparation guide

### Assignment 10.3: Key Concept Extraction
**Task**: Extract and prioritize concepts from syllabus
```
Extract key concepts from this syllabus and categorize them:

CORE CONCEPTS: (essential, foundational)
SUPPORTING CONCEPTS: (important for depth)
NICE-TO-KNOW: (enrichment)

Syllabus excerpt:
"Module 1: Introduction to Project Management covers scope definition, resource 
allocation, risk management, and stakeholder communication. Students learn to develop 
project charters, create work breakdown structures, manage budgets, and implement 
quality assurance processes. The module also touches on Agile vs Waterfall methodologies 
and introduces common PM tools like Asana and Monday.com. We explore change management 
strategies, team dynamics, and leadership principles as they apply to projects..."

For each concept:
- Name
- Importance level (core/supporting/enrichment)
- Depth needed
- How to assess mastery
```

**Expected Output**:
- Prioritized concept list
- Clear importance hierarchy
- Assessment criteria
- Curriculum design guidance

---

## 11. COMPARISON & ANALYSIS PROMPTING
*Analyzing differences and similarities*

### Assignment 11.1: Teaching Method Comparison
**Task**: Compare and analyze teaching approaches
```
Compare these three teaching approaches for teaching "Database Design":

APPROACH A: Lecture + Lab (traditional)
APPROACH B: Project-based learning
APPROACH C: Flipped classroom + peer teaching

For each, analyze:
1. ENGAGEMENT: How engaging for learners?
2. RETENTION: How well do students remember?
3. APPLICATION: How well can they apply knowledge?
4. TIME: How long does instruction take?
5. RESOURCES: What's needed?
6. BEST FOR: What type of learner?
7. CHALLENGES: What are the difficulties?

Then provide:
- Ranking by effectiveness
- Recommendation for this topic
- Hybrid approach suggestion
```

**Expected Output**:
- Systematic comparison
- Evidence-based analysis
- Practical recommendation
- Nuanced hybrid approach

### Assignment 11.2: Assessment Method Analysis
**Task**: Compare assessment approaches for a skill
```
Compare four assessment methods for measuring "SQL Query Writing Ability":

METHOD 1: Multiple choice questions
METHOD 2: Write-and-execute queries (auto-graded)
METHOD 3: Project with queries (human-graded)
METHOD 4: Peer code review

For each method analyze:
1. VALIDITY: Does it measure what it claims?
2. RELIABILITY: Are results consistent?
3. PRACTICALITY: Is it feasible to implement?
4. FEEDBACK VALUE: What feedback does student get?
5. SCALABILITY: Can it work for 100+ students?
6. COST: Time/resources needed
7. LEARNER IMPACT: Effect on learning

Recommendation: Best single method? Best combination?
```

**Expected Output**:
- Detailed method analysis
- Validity/reliability assessment
- Practical implementation notes
- Evidence-based recommendation

### Assignment 11.3: Course Delivery Mode Analysis
**Task**: Compare delivery modes for a course
```
Compare three delivery modes for "Introduction to Machine Learning":

MODE A: Synchronous online (live sessions)
MODE B: Asynchronous self-paced
MODE C: Hybrid (both synchronous and asynchronous)

Analyze from perspective of:
1. THE LEARNER (flexibility, support, community)
2. THE INSTRUCTOR (time investment, scaling)
3. THE INSTITUTION (cost, resources, support)
4. LEARNING OUTCOMES (effectiveness, engagement)

For each perspective, rate 1-10 and justify.

Then provide:
- Overall recommendation
- Best for what situation
- Success factors for each mode
- Potential risks
```

**Expected Output**:
- Multi-perspective analysis
- Justified ratings
- Realistic recommendation
- Implementation insights

---

## 12. PERSONALIZATION PROMPTING
*Tailoring content to individual learners*

### Assignment 12.1: Personalized Learning Path
**Task**: Create customized path for individual learner
```
Create a personalized learning path for this learner:

LEARNER PROFILE:
- Background: Self-taught Python programmer (2 years)
- Goal: Transition to data science career
- Learning style: Prefers hands-on projects
- Time available: 10 hours/week
- Start date: Next month
- Availability: Weekday evenings + weekends

Create a plan including:
1. ASSESSMENT: What skills to evaluate first
2. FOUNDATION: Any prerequisite courses needed
3. CORE PATH: Recommended 12-week sequence
4. ALTERNATIVES: Acceleration or slow options
5. MILESTONES: When to assess progress
6. RESOURCES: Recommended materials for each phase
7. SUPPORT: What support will help
8. TIMELINE: Week-by-week schedule

Make it realistic, achievable, and motivating.
```

**Expected Output**:
- Thorough assessment plan
- Realistic, personalized sequence
- Flexible alternatives
- Clear milestones
- Resource-rich guidance

### Assignment 12.2: Personalized Feedback
**Task**: Generate customized feedback for learner
```
Generate personalized feedback for this learner:

LEARNER DATA:
- Name: Alex
- Course: Python Programming
- Current score: 78%
- Performance trend: Improving (+5% last 2 modules)
- Strength: Problem-solving and logical thinking
- Challenge: Writing clean, readable code
- Learning style: Learns from examples, visual learner
- Engagement: High, completes bonus challenges
- Previous feedback impact: Responded well to specific coding examples

Create feedback that:
1. ACKNOWLEDGES: Specific strengths and progress
2. ADDRESSES: Specific challenge areas
3. PROVIDES: Targeted examples (not just general advice)
4. MOTIVATES: Recognizes effort and growth
5. DIRECTS: Clear next steps
6. ENGAGES: References their learning style

Make it feel personal, not templated.
Max 250 words.
```

**Expected Output**:
- Personal, specific feedback
- Balanced strengths/challenges
- Learning-style-aligned suggestions
- Motivating and actionable
- Appropriate length

### Assignment 12.3: Adaptive Content Recommendation
**Task**: Recommend next content based on learner needs
```
Based on this learner's performance, recommend next steps:

LEARNER DATA:
- Module 1 (Fundamentals): 95%
- Module 2 (Application): 72%
- Module 3 (Advanced): 58%
- Declining performance trend
- Self-reported anxiety about complexity
- Excellent on structured exercises
- Struggles with open-ended problems
- Previous success with detailed step-by-step guidance

FOR NEXT STEPS, provide:
1. RECOMMENDED ACTION: What to do next
2. RATIONALE: Why this makes sense
3. MATERIALS: Specific resources to use
4. SUPPORT: What support to provide
5. ALTERNATIVE: If learner gets stuck
6. ACCELERATION: When/if ready to progress
7. SUCCESS CRITERIA: How to know if working

Consider:
- Preventing discouragement
- Building confidence
- Addressing root causes
- Not regressing learner

Make recommendation based on data, not assumptions.
```

**Expected Output**:
- Data-driven recommendation
- Clear reasoning
- Appropriate pacing
- Support structures
- Success monitoring plan

---

## 13. CREATIVE GENERATION PROMPTING
*Generating novel, creative educational content*

### Assignment 13.1: Scenario-Based Learning Activity
**Task**: Create engaging scenario for learning
```
Create an immersive scenario-based learning activity for teaching "Cybersecurity Basics"

Include:
1. SCENARIO SETUP: Engaging situation that hooks learner
2. CHARACTER: A persona the learner adopts or helps
3. CHALLENGE: A realistic security problem to solve
4. CONSTRAINTS: What resources/limitations exist
5. DECISION POINTS: Where learner chooses actions
6. CONSEQUENCES: What happens based on choices
7. LEARNING MOMENTS: What concepts are reinforced
8. REFLECTION: How learner reflects on choices

Make it:
- Realistic and timely
- Emotionally engaging
- Educational without being preachy
- Different outcomes based on choices
- 10-15 minutes to complete

SECURITY TOPICS TO WEAVE IN:
- Password security
- Phishing awareness  
- Data protection
- Incident response
```

**Expected Output**:
- Compelling scenario
- Multiple decision paths
- Clear learning outcomes
- Engaging narrative
- Practical security focus

### Assignment 13.2: Interactive Quiz Design
**Task**: Design an engaging, game-like quiz
```
Design an interactive quiz for "History of Technology" that:

1. GAMIFICATION: Has game-like elements
   - Point system
   - Levels or progression
   - Badges/achievements
   - Leaderboards (optional)

2. VARIETY: Uses multiple question formats
   - Multiple choice
   - Matching
   - Timeline ordering
   - True/false
   - Fill-the-blank

3. ADAPTIVITY: Adjusts to learner
   - Easier questions early
   - Harder questions after success
   - Hints when struggling
   - Speed bonuses (optional)

4. FEEDBACK: Provides learning, not just scoring
   - Why the answer is right
   - Interesting related facts
   - Encouragement and humor

5. ENGAGEMENT: Keeps learner interested
   - Clear progress bar
   - Motivating messages
   - Time-sensitive elements (optional)
   - Surprise elements

Create outline with:
- Question list (at least 10)
- Point values
- Progression logic
- Badge/achievement descriptions
- Sample feedback messages
```

**Expected Output**:
- Well-structured quiz outline
- Game mechanics clearly defined
- Varied question types
- Adaptive logic
- Engaging feedback examples

### Assignment 13.3: Visual Learning Metaphor
**Task**: Create learning using creative metaphors
```
Explain "Cloud Computing" using an innovative metaphor that:

1. METAPHOR SELECTION: Choose a familiar concept
   (Examples: a library, a restaurant kitchen, a postal system, etc.)

2. MAPPING: Map cloud concepts to metaphor
   - Cloud storage → [metaphor equivalent]
   - Scalability → [metaphor equivalent]
   - Security → [metaphor equivalent]
   - Cost model → [metaphor equivalent]
   - Multi-tenancy → [metaphor equivalent]
   - Virtualization → [metaphor equivalent]

3. ANALOGY EXPLANATION: Explain each comparison clearly

4. PRACTICE QUESTIONS: Create 3 questions using the metaphor
   "In our [metaphor] analogy, what would happen if..."

5. LIMITATIONS: Acknowledge where metaphor breaks down
   (Be honest - no metaphor is perfect)

6. TRANSITION: How to move learners from metaphor to technical understanding

Make metaphor:
- Creative but not obscure
- Easy to visualize
- Accurate enough to build upon
- Memorable
```

**Expected Output**:
- Novel, apt metaphor
- Clear concept mapping
- Practical practice questions
- Honest limitations note
- Learning progression path

---

## Usage Guide for Training Platform

### How to Use These Assignments:

1. **For Instructors Creating Content**
   - Use these assignments to design better courses
   - Apply different techniques to different situations
   - Combine techniques for complex challenges

2. **For Trainer Development**
   - Use as templates for prompt engineering training
   - Show instructors how to apply prompting techniques
   - Demonstrate when to use each technique

3. **For Student Learning Activities**
   - Adapt these for student projects
   - Use as examples of good prompting
   - Have students create similar prompts

4. **For System Prompts**
   - Extract techniques for AI-powered tutors
   - Build into recommendation engines
   - Use in content generation features

### Technique Selection Guide:

| Use Case | Best Techniques |
|----------|-----------------|
| Content Generation | 8, 13, 1 |
| Quality Assessment | 3, 6, 9 |
| Learner Support | 4, 5, 12 |
| Course Design | 2, 7, 11 |
| Question Creation | 2, 9, 10 |
| Personalization | 12, 6, 4 |
| Analysis & Insights | 3, 6, 9, 11 |

---

**Document Version**: 1.0
**Last Updated**: 2024
**Total Assignments**: 39 (13 techniques × 3 assignments each)
