import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, ExternalLink, X, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, syncGmailNotifications, googleAuth } from '../api';
import toast from 'react-hot-toast';
import { useDarkMode } from '../hooks/useDarkMode';
import { formatDistanceToNow } from 'date-fns';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useDarkMode();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: isOpen,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const [isManualSync, setIsManualSync] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const hasGoogleToken = !!localStorage.getItem('google_access_token');

  const syncGmailMutation = useMutation({
    mutationFn: async (isManual: boolean = false) => {
      setIsManualSync(isManual);
      const token = localStorage.getItem('google_access_token');
      if (!token) throw new Error('AUTH_REQUIRED');
      return syncGmailNotifications(token);
    },
    onMutate: () => setIsSyncing(true),
    onSettled: () => {
      setIsSyncing(false);
      setIsManualSync(false);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      setCountdown(300); // Reset countdown on success
      
      if (data && data.count > 0) {
        toast.success(`Found ${data.count} new job updates from your Gmail!`, { icon: '📧' });
      } else if (isManualSync) {
        toast.success('Gmail sync complete. No new updates found.');
      }
    },
    onError: (err: any) => {
      if (err.message === 'AUTH_REQUIRED') {
        if (isManualSync) toast.error('Google Access Token not found. Please sync via Google.');
      } else {
        console.error('Sync error:', err);
        if (isManualSync) toast.error('Failed to sync Gmail. Please check your connection.');
      }
      setCountdown(300); // Reset timer anyway
    }
  });

  // Countdown and Auto-Sync Logic
  useEffect(() => {
    let timer: any;
    if (hasGoogleToken && !isSyncing) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            syncGmailMutation.mutate(false); // Auto sync
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasGoogleToken, isSyncing]);

  const googleMutation = useMutation({
    mutationFn: googleAuth,
    onSuccess: (data) => {
      localStorage.setItem('userInfo', JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setCountdown(300); // Start timer after link
      toast.success('Gmail sync enabled! Refresh to scan.');
    },
    onError: () => toast.error('Google link failed.')
  });
  
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      googleMutation.mutate(tokenResponse.access_token);
    },
    onError: () => toast.error('Google Sign In was unsuccessful'),
    scope: 'email profile https://www.googleapis.com/auth/gmail.readonly',
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const unreadCount = unreadData?.count || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all relative ${
          isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
            <h3 className="font-bold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {hasGoogleToken && (
                <div className="flex items-center gap-2 mr-1">
                  <span 
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                    title="Auto-sync countdown"
                  >
                    {isSyncing ? 'Syncing...' : formatCountdown(countdown)}
                  </span>
                  <button 
                    onClick={() => syncGmailMutation.mutate(true)} 
                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    disabled={isSyncing}
                    title="Manual Sync (Resets Timer)"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!hasGoogleToken && (
            <div className={`p-5 m-3 rounded-2xl border flex flex-col items-center text-center gap-3 animate-pulse-subtle ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                 <FcGoogle className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-bold leading-relaxed mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>To use Gmail Sync features, please login with Google.</p>
                <p className={`text-[10px] leading-relaxed opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Soon will scan your unread recruitment emails for you.</p>
              </div>
              <button 
                onClick={() => loginWithGoogle()}
                className="w-full bg-white dark:bg-slate-800 py-2.5 rounded-xl text-xs font-black shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <FcGoogle className="w-4 h-4" />
                Connect Gmail
              </button>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y dark:divide-slate-800">
                {notifications.map((notification: any) => (
                  <div 
                    key={notification._id} 
                    className={`p-4 transition-colors relative group ${
                      !notification.isRead 
                        ? (isDark ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'bg-blue-50/50 hover:bg-blue-50') 
                        : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className={`text-sm leading-snug mb-1 ${notification.isRead ? (isDark ? 'text-slate-400' : 'text-slate-600') : (isDark ? 'text-slate-200' : 'text-slate-900')}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button 
                                onClick={() => markReadMutation.mutate(notification._id)}
                                className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {notification.link && (
                              <Link 
                                to={notification.link}
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 transition-colors"
                                title="View details"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                            <button 
                              onClick={() => deleteMutation.mutate(notification._id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className={`p-3 text-center border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
