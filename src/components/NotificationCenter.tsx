import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, ExternalLink, X, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, syncGmailNotifications } from '../api';
import toast from 'react-hot-toast';
import { useDarkMode } from '../hooks/useDarkMode';
import { formatDistanceToNow } from 'date-fns';

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

  const syncGmailMutation = useMutation({
    mutationFn: async () => {
      // Mocking OAuth token extraction as requested by assumption
      const token = localStorage.getItem('google_access_token') || 'MOCK_USER_TOKEN';
      return syncGmailNotifications(token);
    },
    onMutate: () => setIsSyncing(true),
    onSettled: () => setIsSyncing(false),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      if (data && data.count > 0) {
        toast.success(`Found ${data.count} new email updates!`);
      } else {
        toast.success('Gmail synced. No new updates.');
      }
    },
    onError: () => toast.error('Failed to sync Gmail')
  });

  // Automatic Gmail syncing has been removed as per user request.
  // Syncing is now purely manual via the Refresh button in the UI.

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <button 
                onClick={() => syncGmailMutation.mutate()} 
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                disabled={isSyncing}
                title="Sync Gmail"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
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
