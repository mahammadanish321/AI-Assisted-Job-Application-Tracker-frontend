# 🎨 Soon — AI-Assisted Tracker (Frontend)

The high-performance, AI-driven user interface for **Soon**. Built for speed, productivity, and a premium tracking experience.

**Live Demo:** [https://ai-assisted-job-application-tracker.vercel.app/](https://ai-assisted-job-application-tracker.vercel.app/)  
**Frontend Repo:** [https://github.com/mahammadanish321/AI-Assisted-Job-Application-Tracker-frontend](https://github.com/mahammadanish321/AI-Assisted-Job-Application-Tracker-frontend)  
**Backend Repo:** [https://github.com/mahammadanish321/AI-Assisted-Job-Application-Tracker-backend](https://github.com/mahammadanish321/AI-Assisted-Job-Application-Tracker-backend)

---

## 🚀 Key Features

*   **📋 Interactive Kanban Board:** A Notion-inspired workspace where you can manage applications through custom stages (e.g., Applied, Interviewing, Offered). Includes smooth drag-and-drop functionality.
*   **🦾 AI-Powered Job Parsing:** Simply paste a job description or URL, and the AI (Gemini/OpenAI) automatically extracts the Company, Role, Salary Range, and Requirements.
*   **📧 Gmail Smart Sync:** Automatically filters your inbox for job-related emails (confirmations, interview invites) and updates your tracking board or notifies you.
*   **📊 Insights & Analytics:** Real-time data visualization of your application pipeline, success rates, and active stages.
*   **🌓 Premium UI/UX:** Specialized Dark and Light modes with a glassmorphism aesthetic.
*   **📥 CSV Export:** One-click download of your entire tracking history for offline management.
*   **🔍 Advanced Filtering:** Search through your applications by company name, role, or status instantly.
*   **📄 Resume Management:** Upload and manage multiple resumes, specifically choosing which one to use for each application.

---

## 📖 User Guide: How to use Soon

1.  **Dashboard/Kanban:** This is your command center. You can move cards between stages to track progress.
2.  **Adding Applications:** Use the "Add New" button. You can enter details manually or use the **AI Magic** button to parse a job description text.
3.  **Gmail Integration:** Connect your Google account in the settings. The system will start scanning for job-related keywords to keep your board up to date.
4.  **Search & Filter:** Use the top search bar to find specific roles or companies. Use the filter dropdown to focus on specific stages.
5.  **Profile & Resumes:** In your profile, you can upload different versions of your resume (e.g., Frontend React, Backend Node). When adding a job, select the most relevant resume.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/mahammadanish321/AI-Assisted-Job-Application-Tracker-frontend.git
cd AI-Assisted-Job-Application-Tracker-frontend
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com

# Backend API URL
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### 3. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🏗️ Technical Stack
- **Framework:** Vite + React 19
- **State Management:** TanStack Query
- **Styling:** Vanilla CSS + Tailwind
- **Icons:** Lucide-React
- **Drag & Drop:** @hello-pangea/dnd
- **Deployment:** Vercel
