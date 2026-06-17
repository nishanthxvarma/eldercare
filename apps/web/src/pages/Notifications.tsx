import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Bell, CheckCircle2, CheckCircle } from 'lucide-react';

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const url = filter === 'unread' ? '/notifications?isRead=false' : '/notifications';
      const res = await apiClient.get(url);
      return res.data.data;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        </div>
        <button 
          onClick={() => markAllAsReadMutation.mutate()}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setFilter('all')}
          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${filter === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          All Notifications
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${filter === 'unread' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Unread
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-8 text-slate-500">Loading notifications...</div>
        ) : notifications?.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-500">
            You're all caught up!
          </div>
        ) : (
          notifications?.map((notification: any) => (
            <div 
              key={notification._id} 
              className={`p-4 rounded-xl border transition-colors flex items-start gap-4 ${notification.isRead ? 'bg-white border-slate-100 text-slate-500' : 'bg-blue-50 border-blue-100 text-slate-900 shadow-sm'}`}
            >
              <div className="flex-1">
                <h3 className={`font-semibold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notification.title}</h3>
                <p className={`text-sm mt-1 ${notification.isRead ? 'text-slate-500' : 'text-slate-700'}`}>{notification.message}</p>
                <span className="text-xs text-slate-400 mt-2 block">{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              {!notification.isRead && (
                <button 
                  onClick={() => markAsReadMutation.mutate(notification._id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
