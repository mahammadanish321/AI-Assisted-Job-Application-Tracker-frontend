# 🎨 Soon — AI-Assisted Tracker (Frontend)

The high-performance, AI-driven user interface for **Soon**. Built for speed, productivity, and a premium tracking experience.

---

## 🚀 Key Features
*   **📋 Pro Kanban Board:** Notion-inspired workspace with custom columns and drag-and-drop.
*   **🦾 AI One-Click Add:** Paste any job link and watch the AI extract all details in milliseconds.
*   **📧 Intelligence Notifications:** Real-time alerts for Gmail updates from tracked companies.
*   **📊 Insights Dashboard:** Beautiful data visualization for your career pipeline.
*   **🌓 Adaptive UI:** Sleek switching between specialized Light and Dark modes.
*   **📥 History Export:** Download your entire application history as a professionally formatted CSV.

---

## 🛠️ Environment Variables
Create a `.env` file in this directory:

```env
# The Google OAuth Client ID used for Login with Google
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# The URL of your deployed backend API (must end with /api)
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production (outputs to /dist)
npm run build
```

---

## 🏗️ Technology
- **Framework:** Vite + React 19
- **State Management:** TanStack Query (React Query)
- **Styling:** Vanilla CSS + Tailwind CSS (Native Theme Support)
- **Icons:** Lucide-React
- **Drag & Drop:** @hello-pangea/dnd
