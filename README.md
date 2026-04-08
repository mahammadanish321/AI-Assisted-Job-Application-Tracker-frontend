# AI-Assisted Job Application Tracker (Frontend)

A modern, high-performance Kanban board for tracking job applications, powered by AI to help you tailor your resume and manage your career search efficiently.

## 🚀 Features

- **Dynamic Kanban Board**: Visualize your application funnel from "Applied" to "Interviewing" and "Offers".
- **AI Resume Co-pilot**: Generate tailored bullet points for your resume based on job descriptions (driven by OpenAI/Mistral).
- **Google OAuth Integration**: Secure and seamless login experience.
- **Micro-interactions & Glassmorphism**: Premium dark/light mode UI with smooth animations.
- **Gmail Sync**: (In Development) Automatically pull application updates from your inbox.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [TanStack Query (React Query) v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 📦 Deployment to Vercel

The project is pre-configured with `vercel.json` for optimal performance.

### 1. Environment Variables

Ensure you add the following environment variables in your Vercel Project Settings:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Cloud Console Client ID | `your-id.apps.googleusercontent.com` |
| `VITE_API_BASE_URL` | The URL of your deployed backend | `https://your-backend.onrender.com/api` |

### 2. Deployment Steps

1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Import the project into Vercel.
3. Vercel will auto-detect the Vite framework.
4. Add the environment variables listed above.
5. Click **Deploy**.

## 💻 Local Development

1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example`.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

---

Built with ❤️ for better career management.
