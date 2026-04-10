import { useDarkMode } from '../hooks/useDarkMode';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const { isDark } = useDarkMode();

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-brand-primary hover:underline mb-8 inline-block">← Back to Home</Link>
        <h1 className="text-4xl font-black mb-8 tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-6 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Data We Collect</h2>
            <p>We collect your email and name when you sign up through Google OAuth. We also store the job applications and profile information you provide to enable our tracking features.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Data</h2>
            <p>Your data is used solely to provide and improve the Job Application Tracker software. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
            <p>We implement security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
            <p>We use essential cookies to keep you logged in and remember your preferences (like Dark Mode).</p>
          </section>
        </div>
      </div>
    </div>
  );
}
