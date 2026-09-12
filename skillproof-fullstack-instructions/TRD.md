# Technical Requirements Document (TRD)

## 1. System Architecture Overview
The application will transition from a static React prototype into a standard MERN-stack application. To streamline development and deployment, the project will utilize a **Monorepo** structure. 

### Monorepo Structure
```text
skillproof-fullstack/
├── frontend/                # Existing React Codebase
│   ├── src/
│   ├── public/
│   └── package.json         # Client dependencies (React, Tailwind, Shadcn, Vite/CRA)
│
├── backend/                 # New Node.js API Layer
│   ├── controllers/         # Business logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routing definitions
│   ├── services/            # AI API wrappers (Gemini)
│   ├── middleware/          # JWT Auth, Error Handlers
│   └── package.json         # Server dependencies (Express, Mongoose, @google/generative-ai)
│
└── package.json             # Root workspace configuration (concurrently)
```

## 2. Technology Stack Selection
### Frontend Layer (Unchanged - Preservation Mode)
* **Framework:** React.js (Client-side rendered)
* **Styling:** Tailwind CSS + Radix UI Primitives (Shadcn UI)
* **Routing:** `react-router-dom` v6+
* **State Management:** React Context API (for Auth), Local component state for UI.
* **Data Fetching:** `axios` or standard `fetch` API. (Replace current hardcoded JSON imports with async API calls).

### Backend Layer (New)
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js for RESTful API construction.
* **Database ODM:** Mongoose (for elegant MongoDB modeling).
* **Authentication:** `jsonwebtoken` (JWT) for stateless session management, `bcryptjs` for password hashing.
* **AI SDK:** `@google/generative-ai` (Official Google SDK for Gemini integration).

## 3. Database Architecture
### Provider: MongoDB Atlas
* **Tier:** M0 Sandbox (Free Tier - 512MB, Shared RAM).
* **Rationale:** MongoDB's document-based structure is ideal for storing highly variable, unstructured data such as JSON-based AI interview feedback, dynamic arrays of skills, and varied GitHub repository objects. It natively supports rapid schema iteration during the hackathon.

## 4. AI Engine Integration
### Provider: Google AI Studio
* **Model:** Gemini 1.5 Flash (Optimized for speed/latency) or Gemini 1.5 Pro (Optimized for complex coding logic evaluation).
* **Cost Structure:** Free Developer Tier.
* **Rate Limits:** 15 RPM (Requests Per Minute), 1 million TPM (Tokens Per Minute), 1500 RPD (Requests Per Day).
* **Integration Strategy:** The frontend will NEVER hold the Gemini API key. All AI requests must route through the Express backend, which securely holds the `GEMINI_API_KEY` in its `.env` file. The backend will construct the massive system prompts, inject the user's code/context, query Gemini, parse the JSON response, and return the sanitized data to the frontend.

## 5. Deployment Pipeline
* **Frontend Hosting:** Vercel (Deployed via GitHub integration targeting the `frontend/` directory).
* **Backend Hosting:** Render.com Web Service (Free Tier) or Vercel Serverless Functions (by moving backend logic into an `api/` directory if strictly required, though a standalone Render Express server is cleaner for this architecture).
* **Environment Variables:** Must be configured in both Vercel and Render dashboards (e.g., `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).

## 6. Zero-Cost Enforcement Strategy
This project strictly enforces a $0 budget constraint. The following alternatives have been mandated to replace enterprise solutions:
* Instead of OpenAI GPT-4 -> **Google Gemini Free Tier**.
* Instead of AWS RDS -> **MongoDB Atlas Free Tier**.
* Instead of Auth0 / Clerk -> **Custom JWT + GitHub OAuth Implementation**.
* Instead of Enterprise ATS Parsers -> **Open-Source Node.js PDF Extractors + Gemini Analysis**.
