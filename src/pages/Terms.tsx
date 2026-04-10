import { useDarkMode } from '../hooks/useDarkMode';
import { Link } from 'react-router-dom';

export default function Terms() {
  const { isDark } = useDarkMode();

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-brand-primary hover:underline mb-8 inline-block">← Back to Home</Link>
        <h1 className="text-4xl font-black mb-8 tracking-tight">Terms of Service</h1>
        
        <div className="space-y-6 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>By using the Job Application Tracker, you agree to comply with these terms. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Prohibited Conduct</h2>
            <p>You agree not to use the service for any illegal activities or to upload harmful content like viruses or malware.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
            <p>The service is provided "as is". We are not liable for any damages resulting from your use of the software.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
