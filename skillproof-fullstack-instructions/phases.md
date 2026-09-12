# Full-Stack Implementation Phases (Roadmap)

To successfully execute this hackathon transition, the AI Agent must follow these phases strictly in chronological order. Do not skip phases or attempt to build the entire stack in one prompt.

## Phase 1: Environment & Monorepo Initialization
**Goal:** Establish the dual-server architecture.
1. Create the `backend/` directory in the project root.
2. Initialize `package.json` in `backend/`. Install `express`, `mongoose`, `cors`, `dotenv`, and `nodemon`.
3. Create a basic `server.js` that listens on Port 5000 and responds to a health check (`/api/health`).
4. Update the root `package.json` with `concurrently` to run both the React frontend and Express backend via a single `npm run dev` command.
* **Checkpoint:** Verify both servers spin up without errors.

## Phase 2: Database & Authentication Layer
**Goal:** Setup MongoDB and secure routes.
1. Create `models/User.js`.
2. Implement `/api/auth/register` and `/api/auth/login` in the backend using `bcryptjs` and `jsonwebtoken`.
3. Create the `middleware/auth.js` JWT verification middleware.
4. Update the React frontend to include an AuthContext. Create a functional login/registration form that stores the JWT in `localStorage` upon success.
* **Checkpoint:** A user can register, login, and stay logged in after a page refresh.

## Phase 3: The AI Engine (Gemini Integration)
**Goal:** Build the core logic behind the product.
1. Install `@google/generative-ai` in the backend.
2. Create `services/geminiService.js` to handle prompt construction and API calls to Google AI Studio.
3. Build the `/api/student/interview/submit` endpoint. It must receive code, send it to Gemini with a strict evaluation prompt, parse the JSON response, and save it to MongoDB.
4. Build the `/api/student/careertwin` endpoint. It must fetch the user's past data from MongoDB and inject it into the Gemini prompt for context-aware advice.
* **Checkpoint:** Backend can successfully communicate with Gemini and log the results to the database.

## Phase 4: Frontend Data Migration (The Wipe)
**Goal:** Remove mock data and wire the UI to the API.
1. Locate all files in `frontend/src` containing hardcoded mock arrays (e.g., `MOCK_CANDIDATES`, `MOCK_INTERVIEWS`).
2. Replace them with `useEffect` hooks that call the new Express API routes using `axios`.
3. Implement Shadcn `<Skeleton>` loaders for loading states.
4. Ensure the Recruiter Dashboard successfully fetches and displays the actual user profiles created during Phase 2.
* **Checkpoint:** The UI looks exactly the same, but data is entirely dynamic.

## Phase 5: Polish & Edge Cases
**Goal:** Ensure hackathon readiness.
1. Implement error handling (Toast notifications) for failed API calls or invalid code submissions.
2. Verify GitHub OAuth integration.
3. Clean up console logs, remove unused dependencies, and ensure the `.env` file structure is clearly documented for deployment.
* **Final Checkpoint:** The platform is ready for the final presentation.
