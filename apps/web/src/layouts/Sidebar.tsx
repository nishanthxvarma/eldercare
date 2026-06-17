import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity, Users, Pill, MessageSquare, Bell, HeartPulse,
  LogOut, ClipboardList, UserCheck, Heart
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { user, logout } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', to: '/admin/dashboard', icon: Activity },
          { name: 'Residents', to: '/admin/residents', icon: Users },
          { name: 'Medications', to: '/medications', icon: Pill },
          { name: 'Caretakers', to: '/admin/caretakers', icon: UserCheck },
          { name: 'Family Members', to: '/admin/family', icon: Heart },
        ];
      case 'CARETAKER':
        return [
          { name: 'Dashboard', to: '/caretaker/dashboard', icon: Activity },
          { name: 'My Tasks', to: '/caretaker/tasks', icon: ClipboardList },
          { name: 'Medications', to: '/medications', icon: Pill },
        ];
      case 'FAMILY':
        return [
          { name: 'Dashboard', to: '/family/dashboard', icon: Activity },
        ];
      default:
        return [];
    }
  };

  const sharedLinks = [
    { name: 'Messages', to: '/messages', icon: MessageSquare },
    { name: 'Notifications', to: '/notifications', icon: Bell },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-slate-200 flex-shrink-0">
          <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <HeartPulse className="w-6 h-6" /> ElderCare
          </span>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</div>
          {getLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <link.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {link.name}
            </NavLink>
          ))}

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Communication</div>
          {sharedLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <link.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
