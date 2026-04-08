import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import KanbanBoard from './components/KanbanBoard';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GetStarted from './pages/GetStarted';
import Profile from './pages/Profile';
import { useDarkMode } from './hooks/useDarkMode';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppLayout({ children }: { children: ReactNode }) {
  const { isDark } = useDarkMode();
  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected pages */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><KanbanBoard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
