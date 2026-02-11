# Skill Proof Generator - Backend

## Overview

Node.js + Express.js backend with MongoDB for the Skill Proof Generator platform. Features dynamic AI-powered assessments with advanced anti-cheating detection.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js (TypeScript)
- **Database:** MongoDB + Mongoose
- **AI:** Google Gemini API (v1.5-flash)
- **File Storage:** UploadThing (cloud-based)
- **Port:** 5000

## Project Structure

```
src/
├── ai/                 # AI services (Gemini integration)
│   └── geminiService.ts
├── config/            # Database & configuration
│   ├── database.ts
│   └── index.ts
├── controllers/       # Request handlers
│   ├── AuthController.ts
│   ├── CandidateController.ts
│   ├── DashboardController.ts
│   └── JobPositionController.ts
├── middleware/        # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── testSession.ts (anti-cheating validation)
│   └── upload.ts
├── models/           # Mongoose schemas
│   ├── Candidate.ts
│   ├── CandidateAnswer.ts (AI evaluations)
│   ├── EvaluationResult.ts
│   ├── HRUser.ts
│   ├── IntegrityLog.ts
│   ├── JobPosition.ts
│   ├── Resume.ts
│   ├── ResumeAnalysis.ts
│   ├── SkillProofReport.ts
│   ├── SkillSession.ts (anti-cheating tracking)
│   ├── TestLink.ts
│   └── ViolationLog.ts (cheating records)
├── routes/           # API endpoints
│   ├── authRoutes.ts
│   ├── candidateRoutes.ts
│   ├── dashboardRoutes.ts
│   ├── jobRoutes.ts
│   ├── assessmentRoutes.ts (dynamic test)
│   └── index.ts
├── services/         # Business logic
│   ├── AuthService.ts
│   ├── CandidateService.ts
│   ├── DashboardService.ts
│   ├── EvaluationService.ts (AI answer evaluation)
│   ├── IntegrityService.ts
│   ├── JobPositionService.ts
│   ├── QuestionService.ts (dynamic question generation)
│   ├── ResumeService.ts
│   ├── SkillSessionService.ts
│   ├── TestLinkService.ts
│   └── ViolationService.ts (anti-cheating)
├── types/            # TypeScript interfaces
│   └── index.ts
├── utils/            # Utility functions
│   ├── crypto.ts
│   ├── errors.ts
│   ├── fileParser.ts
│   ├── generators.ts
│   └── jwt.ts
├── validators/       # Input validation
│   └── index.ts
└── index.ts         # Server entry point
```

## Key Features

### 1. Resume Upload & Analysis

- UploadThing cloud storage integration
- Gemini AI analysis of resumes
- Automatic skill extraction
- Confidence scoring

### 2. Dynamic Assessment System

- **QuestionService:** AI-generated questions (one-at-a-time, never cached)
- Questions distributed: 33% Conceptual, 33% Coding, 33% Scenario
- Difficulty adapts to candidate level (Beginner/Intermediate/Advanced)

### 3. AI Answer Evaluation

- **EvaluationService:** Gemini-powered evaluation
- Scores: 0-100 (Excellent: 90-100, Good: 70-89, Adequate: 50-69, Poor: 30-49, Incomplete: 0-29)
- Metrics: Correctness, Code Quality, Clarity, Understanding Depth
- Overall assessment with strengths/improvements

### 4. Advanced Anti-Cheating

- **ViolationService:** Comprehensive tracking
- 7 violation types: TAB_SWITCH, COPY, PASTE, CAMERA_OFF, FACE_NOT_DETECTED, LOOKING_AWAY, SUSPICIOUS_MOVEMENT
- **4-Strike Auto-Submit:** Session auto-submitted and flagged on 4th violation
- Violation Thresholds:
  - 1st: Warning message
  - 2nd: Strong warning
  - 3rd: Final warning
  - 4th: Auto-submit, lock access, flag for HR
- All violations logged to MongoDB with metadata

### 5. Secure Session Management

- Token-based test access via test links
- Session validation on every request
- Violation threshold checking
- Auto-locking after cheating detected

## API Endpoints

### Assessment Routes (`/api/assessment/:token`)

**GET /question**

- Fetch next question
- Returns: Question object with hints, context, type, difficulty
- Includes warning message based on violation count

**POST /submit-answer**

- Submit answer for evaluation
- Triggers async AI evaluation
- Returns: Whether test is complete, next step

**POST /log-violation**

- Log cheating violation
- Parameters: violationType, description, metadata
- Returns: Updated violation count, auto-submit flag

**GET /status**

- Get current test status
- Returns: Answered count, violations, test status

**POST /submit-test**

- Finalize test
- Returns: Overall score, recommendation, strengths, improvements

### Other Routes

- `POST /api/auth/register` - Register HR user
- `POST /api/auth/login` - Login
- `POST /api/candidate/resume` - Upload & analyze resume
- `POST /api/candidate/:link/skills` - Submit skills
- `GET /api/candidate/:link/resume` - Get resume analysis
- `POST /api/dashboard/violations` - Get violation logs
- `GET /api/job/:positionId` - Get job details

## Environment Variables

```
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_secret
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_app_id
PORT=5000
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
NODE_ENV=development
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Run TypeScript check
npm run typecheck

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database Schemas

### SkillSession (Enhanced with Anti-Cheating)

- `sessionId`, `candidateId`, `jobPositionId`
- `violationCount` (auto-submit at 4)
- `violations[]` (timestamp, type, severity, metadata)
- `cameraMonitoringStatus` (Active/Inactive/Permission_Denied)
- `testStatus` (InProgress/Completed/AutoSubmittedDueToCheating/FlaggedForReview)
- `cheatingFlagged` (boolean for HR review)

### ViolationLog

- `sessionId`, `candidateId`, `violationType`
- `severity` (Low/Medium/High)
- `description`, `timestamp`, `metadata`
- Indexed by: sessionId, candidateId, timestamp, violationType

### CandidateAnswer

- `sessionId`, `candidateId`, `questionId`
- `questionText`, `questionType`, `candidateAnswer`
- `evaluation` (score, correctness, codeQuality, clarity, understandingDepth, feedback, confidenceScore, aiRemarks)
- Indexed by: sessionId, candidateId, questionId, submittedAt

## Gemini Integration

### Question Generation

- **Prompt:** Generates unique questions based on job role, skills, level
- **Output:** Question text, type (Conceptual/Coding/Scenario), difficulty, hints, context
- **Prevention:** Previous questions context prevents repetition

### Answer Evaluation

- **Prompt:** Evaluates answer based on question type and criteria
- **Output:** Score (0-100), metrics (correctness, code quality, clarity, depth), feedback
- **Fallback:** Default assessment if Gemini fails

## Deployment

- Deploy to Vercel serverless or traditional Node.js hosting
- Ensure MongoDB Atlas for database
- Set all environment variables before deployment
- Use `.env.example` as template

## Testing

- TypeScript compilation: `npm run typecheck`
- All code properly typed with interfaces
- Database operations optimized with proper indexing
- Routes protected with authentication middleware
- Anti-cheating validation on all assessment endpoints

## Features Status

- ✅ Resume upload & analysis
- ✅ Dynamic question generation
- ✅ AI answer evaluation
- ✅ 4-strike violation threshold
- ✅ Tab switch detection
- ✅ Copy/paste detection
- ✅ Keyboard shortcut detection
- ✅ Session locking on cheating
- 📋 Camera monitoring (optional)
- 📋 Advanced behavioral analytics (optional)

## Support

For issues or questions, refer to the database connection logs and Gemini API status.
