# Peblo Notes

Peblo Notes is a professional, minimalist, AI-powered collaborative notes workspace. It enables users to securely capture ideas, organize them with tags, share notes publicly, and leverage advanced AI models to generate summaries and actionable items.

## Features

- **Dual-Theme Support**: A premium interface supporting both Dark Mode (Linear-style minimalist) and Light Mode (Clean zinc aesthetic) with a seamless toggle.
- **AI-Powered Insights**: Native integration with NVIDIA NIM (meta/llama-3.3-70b-instruct) to generate instant summaries and structured action items.
- **Organization & Search**: Advanced tagging system with real-time search filtering across titles, content, and tags.
- **Secure Authentication**: Robust JWT-based authentication for user registration, login, and protected workspace routes.
- **Public Sharing**: Generate unique, secure links to share read-only versions of notes with a high-end typography layout.
- **Productivity Dashboard**: Visual analytics using Recharts to track note-taking trends and activity.

## Tech Stack

### Frontend
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS (next-themes)
- Icons: Lucide React
- Charts: Recharts

### Backend
- Server: Node.js & Express.js
- Database: SQLite (Local)
- ORM: Prisma
- Auth: JWT & Bcrypt.js
- AI Integration: NVIDIA NIM API

---

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Configure Environment Variables

**Backend (backend/.env):**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key"
NVIDIA_NIM_API_KEY="your_nvidia_api_key"
```

**Frontend (frontend/.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 3. Installation
```bash
# Backend dependencies
cd backend
npm install
npx prisma db push

# Frontend dependencies
cd ../frontend
npm install
```

### 4. Running the Application
Run these commands in separate terminal windows:

**Backend:**
```bash
cd backend
node src/index.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at http://localhost:3000.

---

## Testing and Verification

1. **Authentication**: Register a new account at /signup and verify login at /login.
2. **Note Management**: Create, edit, and tag notes. Verify that changes persist after a page reload.
3. **AI Integration**: Click "Generate Insights" on a note to verify AI summary and action item parsing.
4. **Public Sharing**: Use the "Share" toggle and verify the public link in an incognito window.
