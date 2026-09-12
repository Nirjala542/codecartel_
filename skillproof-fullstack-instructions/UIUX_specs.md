# UI/UX Specifications & Implementation Details

This document outlines the strict design system rules and UI behaviors that must be preserved and expanded upon during the full-stack transition. The AI agent must NOT break existing UI components when replacing mock data with real API data.

## 1. Design System Foundation (Tailwind CSS)
### 1.1 Theme & Aesthetics
* **Base Theme:** Dark Mode (Class: `dark`). The application must maintain its premium, tech-focused dark aesthetic.
* **Backgrounds:** Utilize Tailwind's `bg-slate-950` or `bg-zinc-950` for primary backgrounds, and `bg-slate-900`/`bg-zinc-900` for cards and elevated surfaces.
* **Accents:** 
  * Primary Action: `text-blue-500` / `bg-blue-600`
  * Success/Verified: `text-emerald-500` / `bg-emerald-500/10`
  * Warning/Failed: `text-rose-500`
  * AI/Magic: `text-purple-500` / `text-cyan-400` (Use gradients for AI-generated text).

### 1.2 Typography
* **Font Family:** `font-sans` (Inter or Roboto defaults).
* **Hierarchy:** Maintain strict tracking (letter-spacing) on main headers (`tracking-tight`) to convey modern SaaS feel.

## 2. Component Library (Shadcn UI)
The project utilizes Radix UI primitives wrapped in Tailwind via Shadcn UI. When building new features, the agent must reuse these components rather than writing custom HTML/CSS structures.
* **Cards:** Used for all container surfaces (Candidate profiles, Job listings, Interview summaries).
* **Badges:** Crucial for displaying skills. Verified skills should use a distinct variant (e.g., `variant="default"`) while self-reported skills should use `variant="outline"`.
* **Sheet (Slide-out Panel):** **CRITICAL UX REQUIREMENT.** The Recruiter Dashboard must use the `<Sheet>` component to slide out candidate deep-dive profiles from the right edge. Do not route the user to a new page. Context preservation is key for recruiters.
* **Progress / Score Dials:** Use circular SVG progress rings to display the `SkillProof Score` (0-100). The stroke color should transition from Red -> Yellow -> Green based on the score value.

## 3. Data State Management (Handling Asynchronicity)
When migrating from synchronous mock data to asynchronous API calls, the UI must gracefully handle intermediate states:
### 3.1 Loading States
* Implement **Skeleton Loaders** (Shadcn `<Skeleton>`) for all heavy data fetches (Dashboard grids, Candidate lists) rather than simple spinners to maintain the premium feel.
* The Live AI Interview submission must feature a custom loading state (e.g., "AI is reviewing your syntax...", "AI is running test cases...") to mask the 2-4 second latency of the Gemini API.

### 3.2 Empty States
* **No Jobs Match:** Display a friendly illustration and suggest the student take more AI Interviews to unlock roles.
* **No Candidates Found:** Prompt the recruiter to loosen their filter criteria.

### 3.3 Error States
* Use `<Toast>` notifications for non-blocking errors (e.g., "Failed to save profile").
* Use inline error text for form validation (Login/Registration).

## 4. Complex Interface Behaviors
### 4.1 The Live IDE
* Must implement a split-pane design.
* Left side: Scrollable markdown area for the problem statement.
* Right side: Code editor area.
* Terminal output must simulate a real console (black background, monospace font, green/red text for pass/fail).

### 4.2 The Career Twin Chat
* Must resemble a modern chat interface (i.e., ChatGPT).
* User messages aligned right (gray bubbles).
* AI messages aligned left (darker slate bubbles, utilizing markdown rendering for code blocks).
* An auto-scroll mechanism must be implemented to keep the newest messages in view.
