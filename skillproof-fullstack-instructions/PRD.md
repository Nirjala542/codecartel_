# Product Requirements Document (PRD)

## 1. Executive Summary
SkillProof is an AI-powered, dual-sided Career Operating System designed to disrupt the traditional hiring pipeline. By replacing unverified, self-reported resumes with hard, cryptographically-backed "SkillProof Scores" generated via live AI technical interviews, the platform eliminates the "Resume Black Hole" for students and drastically reduces technical screening times for recruiters. Following the successful completion of the frontend MVP, this document outlines the requirements to transition the prototype into a fully functional, production-ready MERN-stack application under strict zero-cost constraints.

## 2. Problem Statement
### The Candidate Dilemma
* **The ATS Barrier:** 75% of resumes are rejected by Applicant Tracking Systems before human review due to poor formatting or missing arbitrary keywords.
* **Lack of Mentorship:** Fresh graduates have no localized, contextual feedback mechanism to gauge their "industry readiness" for specific companies.
* **Inability to Prove Skills:** Candidates lack a standardized environment to practice interviews and mathematically prove their coding competencies prior to landing an interview.

### The Recruiter Dilemma
* **Signal vs. Noise:** Recruiters are flooded with applications containing exaggerated or falsified skills.
* **Expensive Screening:** The average technical phone screen costs significant engineering hours. Mis-hires cost upwards of $30,000.
* **Inefficient Discovery:** Current job boards rely on keyword matching rather than competency matching.

## 3. Product Vision & Value Proposition
* **Vision:** To become the standard validation layer for early-career tech talent.
* **For Students:** "Prove your skills in a live IDE, get scored by an unbiased AI, and let recruiters come to you."
* **For Recruiters:** "Stop guessing. Search a database of pre-vetted candidates with immutable AI interview transcripts and GitHub histories attached."

## 4. User Personas
### Persona 1: The Student / Fresher (e.g., Alex)
* **Goal:** Land a junior software engineering role at a top-tier tech company.
* **Pain Point:** Applies to 100+ jobs, gets generic rejections. Doesn't know what to study next.
* **Needs:** Real-time feedback, a verifiable portfolio, and targeted job matches.

### Persona 2: The Technical Recruiter (e.g., Sarah)
* **Goal:** Fill 5 software engineering roles quickly with high-quality candidates.
* **Pain Point:** Spends 20 hours a week conducting initial technical phone screens on candidates who completely fail.
* **Needs:** Instant validation of skills, easy-to-read candidate profiles, and integration with candidate GitHub repositories.

## 5. Functional Scope (MoSCoW Breakdown)
### Must Have (MVP Phase 2)
* **Monorepo Setup:** Segregation of the existing React frontend and new Express backend.
* **Authentication:** Secure JWT login for Students and Recruiters, including GitHub OAuth integration for Students.
* **Database Migration:** Replacement of all static mock data with MongoDB Atlas queries.
* **Live AI Interview Engine:** Backend integration with Google AI Studio (Gemini 1.5) to grade submitted code and generate a `SkillProof Score`.
* **Recruiter Search Engine:** Database queries allowing recruiters to filter the MongoDB cluster by minimum score and required skills.

### Should Have
* **Career Twin RAG:** The Career Twin chatbot should possess "memory" of the student's past interview performances to provide contextual advice.
* **ATS Resume Parsing:** A backend endpoint that extracts text from a PDF upload and uses Gemini to analyze it against ATS best practices.

### Could Have
* Email notifications to students when a recruiter views their profile.
* B2B SSO integration for recruiters.

### Won't Have (Yet)
* Paid OpenAI API integrations.
* Native mobile application.
* Real-time WebRTC video interviews.

## 6. Non-Functional Requirements
### Constraints
* **Financial:** The platform must operate at a $0.00 monthly cost.
* **APIs:** Must strictly utilize Google AI Studio Free Tier (Gemini).
* **Database:** Must fit within the MongoDB Atlas M0 Sandbox limits (512MB storage, shared RAM).

### Performance & Security
* API endpoints must resolve within 2000ms (accounting for LLM generation latency).
* JWT tokens must be stored securely (HttpOnly cookies preferred, or secure LocalStorage).
* Passwords must be hashed via `bcrypt` with a minimum of 10 salt rounds.
* CORS must be strictly configured to allow requests only from the deployed Vercel frontend URL.
