import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Bell } from 'lucide-react';

interface TopbarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar: React.FC<TopbarProps> = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications?isRead=false');
      return res.data.data;
    },
    refetchInterval: 30000 // poll every 30s
  });

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <button
          className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1 flex justify-end items-center gap-4 relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 relative"
          >
            <Bell className="w-5 h-5" />
            {notifications && notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute top-12 right-12 w-80 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{notifications?.length || 0} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications?.slice(0, 5).map((n: any) => (
                  <div key={n._id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <p className="font-medium text-sm text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                ))}
                {(!notifications || notifications.length === 0) && (
                  <div className="p-6 text-center text-sm text-slate-500">No new notifications</div>
                )}
              </div>
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <Link to="/notifications" onClick={() => setShowDropdown(false)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  View All Notifications
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
            <div className="hidden md:block text-sm text-right">
              <div className="font-medium text-slate-900">{user?.firstName} {user?.lastName}</div>
              <div className="text-slate-500 text-xs capitalize">{user?.role.toLowerCase()}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
