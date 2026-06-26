/**
 * Sidebar.jsx — App sidebar for authenticated pages
 * Clean, fixed-width layout for premium stability.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, BarChart3, Dumbbell,
  Bot, User, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard' },
  { icon: BarChart3,      label: 'Analytics',   path: '/analytics' },
  { icon: Dumbbell,       label: 'Workouts',    path: '/workouts' },
  { icon: Bot,            label: 'AI Coach',    path: '/ai-coach' },
  { icon: User,           label: 'Profile',     path: '/profile' },
  { icon: Settings,       label: 'Settings',    path: '/settings' },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="
      hidden md:flex flex-col
      w-60 h-screen sticky top-0
      glass border-r border-white/08
      z-40 flex-shrink-0
    ">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/06">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <span className="text-base font-bold gradient-text whitespace-nowrap">
          FitAI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200 group
              ${isActive
                ? 'bg-violet-600/15 text-violet-400 border-l-2 border-violet-500 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/05 border-l-2 border-transparent'
              }
            `}
          >
            <item.icon
              size={18}
              className="flex-shrink-0 transition-transform group-hover:scale-105"
            />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/[0.05] px-4 py-4 space-y-3.5">
        {/* User avatar row */}
        {user && (
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                {user.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-3 py-2 rounded-xl
            text-slate-400 hover:text-red-400 hover:bg-red-500/10
            transition-all duration-200 group text-sm font-medium
          "
        >
          <LogOut size={16} className="flex-shrink-0 transition-transform group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
