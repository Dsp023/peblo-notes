# Peblo Notes - Development AI Prompt History

This document outlines the structured prompt history and developer interactions used to build, refine, and finalize **Peblo Notes**. This log showcases a collaborative pair-programming approach between the developer and the AI agent, moving systematically through architecture, coding, design tuning, and final deployment stages.

---

## 📅 Stage 1: Core System Architecture & Setup

### Developer Intent
Set up a robust backend utilizing Node.js/Express, Prisma ORM, and SQLite. Connect the application to the frontend Next.js application using Tailwind CSS.

### Key Prompt Sequences
1. **Initialize Backend**:
   > *"Configure an Express server in Node.js. Setup Prisma with SQLite to support two tables: `User` and `Note`. Notes must relate to a specific user. Include an email constraint on the user table."*
2. **Setup Tailwind & Layout**:
   > *"Initialize a Next.js 14 App Router project. Configure a clean workspace shell featuring a persistent Sidebar. The UI must follow a high-end, premium minimalist aesthetic reminiscent of Linear or Vercel."*

---

## 📅 Stage 2: Authentication & CRUD Integration

### Developer Intent
Implement JWT (JSON Web Tokens) for secure route protection, and create backend REST API endpoints corresponding to CRUD operations on notes.

### Key Prompt Sequences
1. **JWT Verification Middleware**:
   > *"Write a secure custom authentication middleware that intercepts requests, extracts the JWT Bearer token from the authorization header, verifies it, and attaches the userId to the request stream."*
2. **Notes Controller**:
   > *"Create REST endpoints in the Express server to list, create, update, and delete notes. Ensure that notes are protected by the JWT middleware and only accessible to the authenticated owner."*

---

## 📅 Stage 3: NVIDIA NIM AI Workspace Integration

### Developer Intent
Leverage state-of-the-art LLMs via the NVIDIA NIM API to synthesize note contents, automatically generating titles, summaries, and action tasks.

### Key Prompt Sequences
1. **NVIDIA NIM Gateway**:
   > *"Configure an external integration service in Express to talk to the NVIDIA NIM API. We want to use the `meta/llama-3.3-70b-instruct` model. Write a service that receives note content and requests structured insights."*
2. **Prompt Engineering & Structuring**:
   > *"Draft a system prompt for the Llama model that forces it to analyze the note text and return exactly a JSON payload. The JSON must contain a brief 1-2 sentence summary, and a list of up to 5 clear action items. Store these results back to the database in columns `summary` and `actionItems` on the Note model so we don't fetch them multiple times."*

---

## 📅 Stage 4: UX Polishing & Dual-Theme Engine

### Developer Intent
Bring the application to life visually by integrating a persistent Light/Dark mode toggle and interactive charts.

### Key Prompt Sequences
1. **Theme Integration**:
   > *"Implement class-based theme switching using the `next-themes` library on the frontend. Style all workspace components (Sidebar, Editor, Analytics) to dynamically support both a bright zinc theme and a deep charcoal theme based on Tailwind's `dark:` classes."*
2. **Productivity Charts**:
   > *"Create a Dashboard segment. Use Recharts to pull relational database states and display interactive charts tracking total notes written, tag counts, and learning trends."*

---

## 📅 Stage 5: Collaboration Engine & Production Safeguards

### Developer Intent
Add a frictionless public note sharing feature and prepare the codebase for secure production environments.

### Key Prompt Sequences
1. **Public Sharing Link**:
   > *"Add a public boolean flag to the Note model. If active, expose a public read-only route `shared/[id]/page.tsx` on the frontend. The layout must have high-end typography, allowing non-logged-in users to read shared note summaries and contents cleanly."*
2. **Environment Variable Safeguards**:
   > *"Create a `.env.example` file that shows how to configure `DATABASE_URL`, `JWT_SECRET`, and `NVIDIA_NIM_API_KEY` for development. Ensure that all raw database credentials and API keys are ignored by `.gitignore` so they are never exposed in Git history."*
