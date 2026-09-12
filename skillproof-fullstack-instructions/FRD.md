# Functional Requirements Document (FRD)

This document details the exact functional behavior of the core systems required to replace the prototype's mock data with a production-ready backend.

## 1. Authentication & Session Management
### 1.1 Multi-Role Architecture
The system must distinguish between two primary roles: `STUDENT` and `RECRUITER`.
* **Registration:** When a user registers, the frontend must send a `role` payload. The backend will store this in the User document.
* **Login:** The `/api/auth/login` endpoint validates credentials and returns a signed JWT containing `{ userId, role }`.
* **Session Persistence:** The frontend will store the JWT (e.g., in `localStorage`) and attach it as a `Bearer` token in the `Authorization` header of all subsequent API requests.

### 1.2 GitHub OAuth Flow (Students Only)
* **Goal:** Verify identity and sync repositories.
* **Flow:** Student clicks "Sign in with GitHub". Frontend redirects to GitHub authorization URL. GitHub redirects back with a `code`. Frontend sends `code` to backend `/api/auth/github/callback`. Backend exchanges code for an access token, fetches user data from GitHub API, creates/updates MongoDB user, and returns a JWT to the frontend.

## 2. Core Engine 1: Live AI Interview Validation
### 2.1 Initialization
* Student selects a target role (e.g., "React Developer").
* Frontend requests a question from `/api/interview/start`. Backend queries Gemini to generate a dynamic coding challenge, test cases, and boilerplate code, returning it to the frontend.

### 2.2 Execution & Evaluation
* Student writes code in the frontend IDE and clicks "Submit".
* Frontend sends `{ studentId, code, questionId }` to `/api/interview/evaluate`.
* **Backend Processing:**
  1. Backend constructs a highly strict prompt for Gemini, enclosing the student's code.
  2. Prompt instruction: "Act as a senior engineer. Evaluate the following code for syntax, logic, and efficiency. Return ONLY a valid JSON object containing: `{ score: Integer (0-100), passed: Boolean, feedback: String, improvements: Array }`."
  3. Backend parses the JSON response.
  4. Backend creates a new `Interview` document in MongoDB storing the result.
  5. Backend updates the `User` document, recalculating their average `SkillProof Score`.
  6. Backend returns the parsed JSON to the frontend to render the success/failure modal.

## 3. Core Engine 2: Career Twin (Context-Aware RAG)
### 3.1 Chat Interface
* Frontend provides a conversational chat UI.
* When a user sends a message, frontend calls `/api/careertwin/chat`.

### 3.2 Context Injection
* **Crucial Functional Requirement:** The Career Twin must not be generic. It must know the user.
* Upon receiving a chat request, the backend first queries MongoDB for the user's `skills`, `overallScore`, and latest `Interview` results.
* The backend constructs a system prompt: *"You are SkillProof Career Twin. You are advising a user with a SkillProof Score of {overallScore}, who recently failed an interview regarding {topic}. The user is asking: {query}."*
* Backend streams (or returns) the Gemini response to the frontend.

## 4. Core Engine 3: Smart Job Matching & Recruiter Discovery
### 4.1 Recruiter Dashboard (Search & Filter)
* **Endpoint:** `GET /api/candidates`
* **Query Parameters:** `?minScore=80&skills=React,Node`
* **Functionality:** Backend executes a MongoDB query: `User.find({ role: 'STUDENT', overallScore: { $gte: minScore }, skills: { $in: skillsArray } })`.
* **Deep Dive:** When a recruiter clicks a candidate, a subsequent call to `GET /api/candidates/:id/history` fetches all past AI interview transcripts for proof.

### 4.2 Job Matching Algorithm
* **Endpoint:** `GET /api/jobs/matches`
* **Functionality:** When a student views the job board, the backend fetches active jobs. It runs a lightweight matching algorithm comparing the student's verified skills array against the job's `requiredSkills` array, generating a `matchPercentage`. Jobs are returned sorted by this percentage.
