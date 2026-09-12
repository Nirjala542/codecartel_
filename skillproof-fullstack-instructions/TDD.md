# Technical Design Document (TDD) - Data & APIs

## 1. MongoDB Database Schemas (Mongoose)

### 1.1 User Schema (`models/User.js`)
```javascript
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['STUDENT', 'RECRUITER'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed via bcrypt
  githubProfile: {
    username: String,
    repoCount: Number,
    lastSync: Date
  },
  skills: [{ 
    name: String, 
    verified: Boolean,
    score: Number 
  }],
  overallSkillProofScore: { type: Number, default: 0 },
  company: { type: String } // For recruiters only
}, { timestamps: true });
```

### 1.2 Interview Transcript Schema (`models/Interview.js`)
```javascript
const interviewSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true }, // e.g., "Frontend Developer"
  questionPrompt: { type: String, required: true },
  submittedCode: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  passed: { type: Boolean, required: true },
  aiFeedback: { type: String, required: true },
  durationSeconds: { type: Number }
}, { timestamps: true });
```

### 1.3 Job Schema (`models/Job.js`)
```javascript
const jobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String },
  requiredSkills: [String],
  minSkillProofScore: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

---

## 2. Express REST API Endpoint Specifications

### 2.1 Authentication (`/api/auth`)
| Method | Route | Body | Description |
|---|---|---|---|
| POST | `/register` | `{ role, name, email, password }` | Hashes password, creates User, returns JWT. |
| POST | `/login` | `{ email, password }` | Validates credentials, returns JWT. |
| GET | `/me` | None (Requires JWT) | Returns profile of currently authenticated user. |

### 2.2 Student Operations (`/api/student`)
| Method | Route | Body | Description |
|---|---|---|---|
| POST | `/interview/start` | `{ targetRole }` | Calls Gemini to generate a question, returns it. |
| POST | `/interview/submit` | `{ questionId, code }` | Calls Gemini to grade code, saves to `Interview` collection, updates User score, returns feedback. |
| POST | `/careertwin/chat` | `{ messageHistory }` | Fetches user context, appends to history, calls Gemini, returns AI response. |
| POST | `/resume/parse` | FormData (PDF/Text) | Analyzes uploaded resume text via Gemini. |

### 2.3 Recruiter Operations (`/api/recruiter`)
| Method | Route | Body | Description |
|---|---|---|---|
| GET | `/candidates` | `?skills=React,Node&minScore=75` | Queries `User` collection for matching students. |
| GET | `/candidates/:id` | None | Returns specific student profile + populated `Interview` history. |
| POST | `/jobs` | `{ title, requiredSkills, minScore }` | Creates a new job posting. |

---

## 3. Security & Middleware
* **AuthMiddleware (`middleware/auth.js`):** Intercepts requests, verifies the `Authorization: Bearer <token>` header using `jsonwebtoken`, and attaches `req.user` to the request object. If missing or invalid, returns `401 Unauthorized`.
* **RoleMiddleware:** Checks if `req.user.role === 'RECRUITER'` for protected recruiter routes.
