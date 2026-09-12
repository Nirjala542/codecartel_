# AI Agent Memory & Context Directives

**CRITICAL DIRECTIVE:** The AI Agent executing tasks in this repository must parse and strictly adhere to these rules before writing any code. Failure to do so will result in a broken hackathon submission.

## 1. Project Context & Status
* **Status:** The user has successfully completed Round 1 of the "Nerds Hack Days Lucknow" hackathon with a static React prototype.
* **Objective:** The objective of the current session is to upgrade the static prototype into a fully functional MERN-stack application for the Final Round. Time is extremely limited. Code must be highly optimized, bug-free, and directly executable. Avoid abstract over-engineering.

## 2. The Zero-Cost Mandate
* The user has a strict $0.00 budget. They possess NO paid API keys.
* **Rule:** Do NOT implement, suggest, or write code requiring the OpenAI API (`openai` package).
* **Rule:** You MUST use the `@google/generative-ai` package and configure it to use the Gemini Free Tier.
* **Rule:** You MUST assume a MongoDB Atlas Free Tier sandbox environment.

## 3. Monorepo Structural Integrity
* You are operating within a Monorepo.
* **Frontend:** Located in `./frontend`. It is a React application. Do NOT write backend Node.js code, `mongoose` models, or direct database connections inside this folder.
* **Backend:** Located in `./backend`. It is an Express.js application. Do NOT put React components here.
* **Execution:** Ensure you understand that `npm run dev` in the root folder will use a tool like `concurrently` to spin up both servers.

## 4. UI/UX Preservation (The Golden Rule)
* The user has already spent significant time perfecting the Tailwind CSS and Shadcn UI design. It looks premium and beautiful.
* **Rule:** When replacing hardcoded mock data with dynamic API data, you must absolutely PRESERVE the existing Tailwind class names, layout structures, and DOM hierarchies. 
* **Rule:** Do not carelessly delete components and replace them with standard HTML tags. Carefully map the API response variables to the exact existing JSX components.

## 5. Security Posture
* Do not expose the `GEMINI_API_KEY` or `MONGO_URI` in the frontend code. They must only exist in the `backend/.env` file.
* Use JWTs stored securely for session persistence.
