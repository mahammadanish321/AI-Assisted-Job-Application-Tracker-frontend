import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, User } from 'lucide-react';
import { getProfile } from '../api';
import { useDarkMode } from '../hooks/useDarkMode';
import NotificationCenter from './NotificationCenter';
import logo from '../assets/apple-touch-icon.png';

export default function Navbar() {
  const { isDark, toggle } = useDarkMode();

  const { data: userInfo } = useQuery({ 
    queryKey: ['profile'], 
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const dark = isDark;
  const navBg = dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';

  return (
    <nav className={`${navBg} border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm`}>
      <div className="flex items-center gap-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-lg shadow-md shadow-blue-500/20 overflow-hidden">
            <img src={logo} alt="Soon Logo" className="w-8 h-8 object-contain" width="32" height="32" />
          </div>
          <span className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>Soon</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NotificationCenter />
        
        <button onClick={toggle} className={`p-2 rounded-lg transition-colors ${dark ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Toggle dark mode">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <Link to="/profile" className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-colors ${dark ? 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'} border shadow-sm`}>
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-500/10">
            {userInfo?.avatar ? (
              <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className={`w-4 h-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
            )}
          </div>
          <span className="text-sm font-semibold max-w-[100px] truncate hidden sm:inline-block">
            {userInfo?.name || 'Profile'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
