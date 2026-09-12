# Frontend Page Structure & Routing Map

This document outlines the required React component hierarchy and routing structure using `react-router-dom`. The agent must implement robust route protection to ensure Students cannot access Recruiter pages and vice-versa.

## 1. App Router Configuration (`src/App.js` or `src/routes.js`)
The root application must be wrapped in an authentication provider (`AuthProvider`) that manages the global user state and JWT token in memory.

### 1.1 Public Routes
* `/` -> `LandingPage.jsx`: The marketing site. Must include clear entry points ("I am a Student" / "I am a Recruiter").
* `/login` -> `AuthPage.jsx`: Dynamic form that handles both login and registration, toggling state based on user selection.

### 1.2 Protected Routes (HOC Wrapper: `<ProtectedRoute role="STUDENT">`)
* `/student/dashboard` -> `StudentDashboard.jsx`: The main hub. Displays the SkillProof Score Dial, recent interview history, and quick actions.
* `/student/interview/setup` -> `InterviewSetup.jsx`: Allows user to select role and difficulty before starting.
* `/student/interview/live/:id` -> `LiveIDE.jsx`: The core split-screen coding environment. Locks the user in (warns on navigation away).
* `/student/career-twin` -> `CareerTwin.jsx`: Full-page or persistent chat interface for the AI mentor.
* `/student/jobs` -> `JobBoard.jsx`: Displays jobs sorted by match percentage based on the user's verified skills.
* `/student/ats-polish` -> `ATSPolish.jsx`: File upload interface and feedback rendering area.

### 1.3 Protected Routes (HOC Wrapper: `<ProtectedRoute role="RECRUITER">`)
* `/recruiter/dashboard` -> `RecruiterDashboard.jsx`: The core discovery grid. Features advanced filtering sidebar on the left, and a grid of candidate cards on the right.
* **Component Detail:** The candidate card click must trigger a `<CandidateSheet>` component rather than a route change.
* `/recruiter/jobs/manage` -> `ManageJobs.jsx`: Dashboard to create, edit, and delete job postings.

## 2. Component Refactoring Plan (Mock to Real)
Currently, the frontend components (e.g., `RecruiterDashboard.jsx`) import static arrays like `MOCK_CANDIDATES`. 
The agent must:
1. Identify these static imports.
2. Replace them with standard React `useEffect` hooks.
3. Utilize `axios` to fetch data from the Express backend (e.g., `axios.get('/api/recruiter/candidates')`).
4. Implement `<Skeleton>` components to render while the `isLoading` state is true.
5. Handle errors by rendering an empty state or a toast notification.
