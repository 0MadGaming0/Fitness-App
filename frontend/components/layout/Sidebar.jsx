/**
 * Sidebar.jsx — Collapsible app sidebar.
 * Expanded (240px): shows icons + labels.
 * Collapsed (64px):  shows icons only with tooltips.
 * State is persisted in localStorage so it survives navigation.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, Dumbbell,
  Bot, User, Settings, LogOut, PanelLeftClose, PanelLeftOpen, BookOpen, MessageSquare, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AvatarDisplay } from '../ui/AvatarDisplay';
import toast from 'react-hot-toast';
import { useState } from 'react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BarChart3,       label: 'Analytics',  path: '/analytics' },
  { icon: Dumbbell,        label: 'Workouts',   path: '/workouts'  },
  { icon: BookOpen,        label: 'Exercises',  path: '/exercises' },
  { icon: Bot,             label: 'AI Coach',   path: '/ai-coach'  },
  { icon: User,            label: 'Profile',    path: '/profile'   },
  { icon: Settings,        label: 'Settings',   path: '/settings'  },
];

const STORAGE_KEY = 'fitai_sidebar_collapsed';

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const displayItems = user?.email === 'owner@fitai.com'
    ? [...NAV_ITEMS, { icon: MessageSquare, label: 'Feedbacks', path: '/admin/feedback' }]
    : NAV_ITEMS;

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, String(!prev));
      return !prev;
    });
  };

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen sticky top-0 glass border-r border-white/08 z-40 flex-shrink-0 overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      {/* ─── Logo row ─── */}
      <div
        className="flex items-center border-b border-white/06 flex-shrink-0"
        style={{
          padding: '0 14px',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '64px',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="logo-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="text-base font-bold gradient-text whitespace-nowrap overflow-hidden"
              >
                FitAI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse button — only visible when expanded */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.button
              key="collapse-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={toggle}
              title="Collapse sidebar"
              className="flex items-center justify-center rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-200"
              style={{ width: '30px', height: '30px', flexShrink: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
            >
              <PanelLeftClose size={17} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Nav ─── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          display: 'flex', flexDirection: 'column',
          gap: '4px',
          padding: collapsed ? '12px 8px' : '16px 10px',
        }}
      >
        {/* Expand button — only visible when collapsed, at the top of the nav */}
        {collapsed && (
          <button
            onClick={toggle}
            title="Expand sidebar"
            className="flex items-center justify-center rounded-xl transition-all duration-200 group"
            style={{
              width: '100%', padding: '10px 0', marginBottom: '4px', border: 'none', cursor: 'pointer',
              background: 'rgba(124,58,237,0.12)',
              color: '#a78bfa',
            }}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        {displayItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => `
              flex items-center rounded-xl transition-all duration-200 group relative
              ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}
              ${isActive
                ? 'bg-violet-600/15 text-violet-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/05'
              }
            `}
            style={({ isActive }) => ({
              borderLeft: collapsed ? 'none' : isActive ? '2px solid #8b5cf6' : '2px solid transparent',
            })}
          >
            <item.icon size={18} className="flex-shrink-0 transition-transform group-hover:scale-105" />

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key={`label-${item.path}`}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.16 }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip when collapsed */}
            {collapsed && (
              <div style={{
                position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
                marginLeft: '10px', padding: '5px 10px', borderRadius: '8px',
                background: 'rgba(20,20,35,0.97)', border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '12px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap',
                pointerEvents: 'none', opacity: 0, zIndex: 999,
                transition: 'opacity 0.15s',
              }}
              className="sidebar-tooltip"
              >
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ─── User + Logout ─── */}
      <div
        className="border-t border-white/[0.05] flex-shrink-0"
        style={{ padding: collapsed ? '12px 8px' : '12px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        {/* User row */}
        {user && (
          <div
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px', padding: collapsed ? '6px 0' : '4px 4px',
              overflow: 'hidden',
            }}
            title={collapsed ? `${user.name || 'User'} · ${user.email}` : undefined}
          >
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              <AvatarDisplay avatar={user.avatar} initials={initials} size={32} shadow={false} fontSize="11px" />
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.16 }}
                  style={{ overflow: 'hidden', minWidth: 0 }}
                >
                  <p className="text-xs font-semibold text-white truncate" style={{ maxWidth: '140px' }}>
                    {user.name || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate" style={{ maxWidth: '140px' }}>
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : '10px',
            padding: collapsed ? '10px 0' : '8px 8px',
            width: '100%',
          }}
        >
          <LogOut size={16} className="flex-shrink-0 transition-transform group-hover:-translate-x-1" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.16 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
