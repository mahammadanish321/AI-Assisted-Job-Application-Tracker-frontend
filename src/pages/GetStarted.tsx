import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Kanban, FileText, ArrowRight, Moon, Sun, CheckCircle2, Zap } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import logo from '../assets/apple-touch-icon.png';

// Memoized components for fast rendering
const HeroSection = memo(({ isDark }: { isDark: boolean }) => (
  <section className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center relative overflow-hidden">
    {/* Animated background elements */}
    <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse ${isDark ? 'bg-brand-primary' : 'bg-blue-400'}`} />
    <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse delay-700 ${isDark ? 'bg-indigo-600' : 'bg-indigo-300'}`} />
    
    <div className="relative max-w-4xl mx-auto">
      <div className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full mb-8 backdrop-blur-md transition-all hover:scale-105 ${isDark ? 'bg-slate-800/40 border-slate-700 text-blue-400' : 'bg-blue-50/50 border-blue-100 text-blue-600'}`}>
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span className="text-xs font-bold tracking-wide uppercase">New: Powered by OpenAI o3-mini</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8">
        Accelerate your <br />
        <span className="bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-accent bg-clip-text text-transparent">Career Pipeline.</span>
      </h1>
      
      <p className={`text-lg md:text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto mb-12 leading-relaxed font-medium`}>
        The AI-native workspace for high-growth professionals. Track applications, extract insights, and craft tailored resumes with OpenAI's most advanced models.
      </p>
      
      <div className="flex items-center justify-center gap-5 flex-wrap">
        <Link to="/signup" className="group relative inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-indigo text-white font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-brand-primary/40 transition-all text-xl hover:-translate-y-1">
          Get Started for Free 
          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link to="/login" className={`inline-flex items-center gap-2 font-bold px-10 py-5 rounded-2xl border transition-all text-xl ${isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
          Sign In
        </Link>
      </div>
    </div>
  </section>
));

const FeaturesSection = memo(({ isDark }: { isDark: boolean }) => (
  <section className={`px-6 py-32 relative overflow-hidden ${isDark ? 'bg-slate-950/50' : 'bg-slate-50/50'}`}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Professional-grade tools</h2>
        <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'} font-medium`}>Everything you need to stand out in a competitive market.</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {[
          { 
            icon: Sparkles, 
            color: 'blue', 
            title: 'OpenAI Extraction', 
            desc: 'Paste any job link or text. Our OpenAI-powered engine extracts salary, skills, and seniority instantly.',
            detail: '99% extraction accuracy'
          },
          { 
            icon: Kanban, 
            color: 'indigo', 
            title: 'Intelligent Board', 
            desc: 'A Notion-style Kanban board optimized for speed. Add, rename, and recolor stages with a single click.',
            detail: 'Fully customizable'
          },
          { 
            icon: FileText, 
            color: 'rose', 
            title: 'Bullet Generator', 
            desc: 'Generate high-impact resume bullets tailored to specific job requirements using deep contextual AI.',
            detail: 'ATS-optimized keywords'
          },
        ].map(({ icon: Icon, color, title, desc, detail }) => (
          <div key={title} className={`p-10 rounded-[32px] border transition-all hover:scale-[1.02] ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700 shadow-2xl' : 'bg-white border-slate-100 hover:border-slate-200 shadow-xl shadow-slate-200/50'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-${color}-500/10`}>
              <Icon className={`w-7 h-7 text-${color}-500`} />
            </div>
            <h3 className="font-black text-2xl mb-4 tracking-tight">{title}</h3>
            <p className={`text-base leading-relaxed mb-8 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary">
              <CheckCircle2 className="w-4 h-4" />
              {detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Footer = memo(({ isDark }: { isDark: boolean }) => (
  <footer className={`py-12 border-t ${isDark ? 'border-slate-900 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
    <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Soon" className="w-6 h-6 grayscale hover:grayscale-0 transition-all opacity-50" />
        <span className="font-bold text-sm tracking-tighter uppercase">Soon Workspace</span>
      </div>
      <p className="text-xs font-medium">Built for the next generation of talent · Powered by OpenAI</p>
      <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
        <Link to="/privacy-policy" className="hover:text-brand-primary transition-colors">Privacy</Link>
        <Link to="/terms" className="hover:text-brand-primary transition-colors">Terms</Link>
      </div>
    </div>
  </footer>
));

export default function GetStarted() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-brand-primary selection:text-white ${isDark ? 'dark bg-[#020617] text-slate-100' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <header className={`px-10 py-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'border-slate-900/50' : 'border-slate-100/50'}`}>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl shadow-2xl shadow-brand-primary/20 overflow-hidden ring-1 ring-white/10">
            <img 
              src={logo} 
              alt="Soon Logo" 
              className="w-10 h-10 object-contain" 
              width="40" 
              height="40"
              loading="eager"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter">Soon</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggle} className={`p-2.5 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="hidden sm:flex items-center gap-8">
             <Link to="/login" className={`text-sm font-bold tracking-wider uppercase ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'} transition-colors`}>Sign In</Link>
             <Link to="/signup" className="text-sm font-black bg-slate-900 dark:bg-brand-primary text-white px-6 py-3 rounded-[14px] transition-all hover:shadow-xl hover:shadow-brand-primary/20 active:scale-95">
               Try Now
             </Link>
          </div>
        </div>
      </header>

      <HeroSection isDark={isDark} />
      <FeaturesSection isDark={isDark} />
      <Footer isDark={isDark} />
    </div>
  );
}
