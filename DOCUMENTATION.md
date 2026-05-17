# Peblo Notes - Technical Submission & Architecture Documentation

This document serves as the comprehensive technical documentation for **Peblo Notes**, submitted for the Full Stack Developer Challenge. It is explicitly structured to align with the core evaluation areas defined in the submission criteria.

---

## 1. 🎨 Frontend Engineering

### Component Structure
The frontend is built using **Next.js 14 App Router** with a highly organized component directory:
* **Route Segments (`src/app`)**: Clean separation between standard landing/public routes and authenticated routes via a `(workspace)` route group.
  * `(workspace)/dashboard/page.tsx`: Handles analytics, charts, and system status widgets.
  * `(workspace)/notes/page.tsx`: A single-page application workspace layout matching premium SaaS tools (like Linear and Vercel).
  * `shared/[id]/page.tsx`: Dynamically routed read-only pages optimized for sharing.
* **Reusable UI Components (`src/components`)**: Built with modularity and reusability in mind.
  * `Sidebar.tsx`: Global navigation panel integrating route checks, workspace states, and the theme engine toggle.
  * `ThemeProvider.tsx`: Wraps the application to guarantee persistent color configurations without hydration flickering.

### State Management
* **Global Authentication (`AuthContext.tsx`)**: Utilizes React Context API to manage user session tokens, login states, and redirects globally, preventing unauthorized access to protected routes.
* **Theme State Management (`next-themes`)**: Configured class-based dark mode management syncing local storage states with user preferences dynamically.
* **Local Workspace UI State**: Dynamic states for note creation, filtering, active note selection, and tags updates to provide an instantaneous interface response.

### UX Quality
* **Dual-Theme Engine**: Hand-crafted, seamless support for **Dark Mode** (zinc and absolute black) and **Light Mode** (sleek slate scales).
* **Search & Filters**: Debounced instant search filtering across titles, note content, and specific tags in real-time.
* **Micro-Animations**: Hover states, smooth active transitions, and loading skeletons provide high interactive feedback to the user.

---

## 2. ⚡ Backend Engineering

### Architecture & Modularity
The backend Express application uses a structured **MVC/Service layer split** for clean maintainability:
* `src/index.js`: App initialization, global middleware setup (CORS, body parser), and base routing.
* `src/routes/`: Route definitions separating domains clearly:
  * `auth.js`: Handles user registrations and login operations.
  * `notes.js`: Handles RESTful CRUD operations for notes.
  * `ai.js`: Manages triggers for AI summaries.
* `src/services/ai.js`: Independent third-party integrations (NVIDIA NIM Gateway), ensuring AI providers can be updated without touching route handlers.

### API Design & Security
* **RESTful Standards**: Standardized endpoints with appropriate HTTP status codes, structured JSON responses, and error-handling try-catch blocks.
* **Secure JWT Middleware**: Custom authentication middleware (`src/middleware/auth.js`) that intercepts requests, decodes the JWT bearer token, validates the user, and attaches the `userId` to the request stream.

---

## 3. 🧠 AI Integration

### NVIDIA NIM Gateway
Native integration with the **NVIDIA NIM API** leveraging the **`meta/llama-3.3-70b-instruct`** model for high-reasoning, low-latency contextual processing.

### Workflow Integration & Prompt Engineering
* **Context-Driven Prompting**: We provide structured instructions to the LLM to analyze note titles, tags, and content, returning a structured summary and actionable task list.
* **Payload Structure & Parsing**: The backend service enforces raw completion constraints, parses Llama's markdown bullet structures, and maps it directly into standard UI components.
* **Persistence Layer**: Once the AI generates insights, they are persisted directly to the SQLite database (`Note.summary` and `Note.actionItems`), making summaries instantly retrievable on reload without wasting API credits.

---

## 4. 🗄️ Database Design

### Schema Design & Scale
We use **Prisma ORM** as a type-safe interface for our database layer. The schema uses a highly readable relational structure:
* **User Model**: Holds security credentials (hashed with bcrypt) and has a one-to-many relationship with `Note`.
* **Note Model**: The central node holding content, public flags, creation/modification timestamps, and optional AI-generated fields (`summary` and `actionItems`).
* **Tag Model**: Relates to `Note` with a clean foreign key constraint, using `onDelete: Cascade` to automatically wipe associated tags when a note is deleted.

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  notes     Note[]
  createdAt DateTime @default(now())
}

model Note {
  id          String   @id @default(uuid())
  title       String
  content     String
  isPublic    Boolean  @default(false)
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  tags        Tag[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  summary     String?
  actionItems String?
}

model Tag {
  id      String @id @default(uuid())
  name    String
  note    Note   @relation(fields: [noteId], references: [id], onDelete: Cascade)
  noteId  String
}
```

---

## 5. 🔍 Code Quality & Maintainability

* **Strong Typing**: 100% of the frontend utilizes strict TypeScript typing for API responses and component props.
* **Separation of Concerns**: Business logic is separated from styling. The API layer (`src/lib/api.ts` on the frontend) communicates cleanly through dynamic models.
* **Readable & Organised**: Documented helper files, consistent indentations, clear semantic element selections (HTML5), and a complete absence of dead/legacy code blocks.

---

## 6. 💡 Product Thinking

Peblo Notes was built as a cohesive **Learning Buddy Companion**, not just a simple notes editor:
* **The Dashboard**: Promotes user engagement by presenting active note counters, tracking the primary concepts they are studying via a tag cloud, and showcasing active study streaks.
* **Frictionless Collaboration**: The public toggle generates immediate read-only shared versions, allowing users to study together and publish their insights with a premium, focused read-view.
* **AI Assistance**: Seamlessly translates cluttered thoughts into organized action items in a single click, driving productivity.

---

## 🚀 Setup & Execution Instructions

Detailed instructions are located in the [README.md](README.md) file, but in summary:
1. Configure `.env` in `backend/` and `.env.local` in `frontend/`.
2. Run `npm install` in both directories.
3. Synchronize database: `npx prisma db push` (from `backend/`).
4. Boot Backend: `node src/index.js` (starts on port `5000`).
5. Boot Frontend: `npm run dev` (starts on port `3000`).
