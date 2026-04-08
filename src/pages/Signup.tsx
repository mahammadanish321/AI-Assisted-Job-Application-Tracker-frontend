import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../api';
import logo from '../assets/apple-touch-icon.png';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success(`Success! Welcome to Soon, ${data.name}.`);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200">
        <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20" />
          <div className="relative inline-flex mb-4 rounded-xl shadow-lg ring-4 ring-blue-500/10 overflow-hidden">
            <img src={logo} alt="Soon Logo" className="w-11 h-11 object-contain" width="44" height="44" />
          </div>
          <h2 className="relative text-2xl font-bold text-white tracking-tight">Get Started with Soon</h2>
          <p className="relative text-slate-300 mt-2 text-sm">Track your progress and auto-generate AI resumes.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username / Name</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium text-slate-800"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium text-slate-800"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium text-slate-800"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={registerMutation.status === 'pending'}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {registerMutation.status === 'pending' && <Loader2 className="w-5 h-5 animate-spin" />}
            Sign Up
          </button>

          <p className="text-center text-sm font-medium text-slate-500 pt-5 mt-5 border-t border-slate-100">
            Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
