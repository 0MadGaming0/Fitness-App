/**
 * MobileNav.jsx — Bottom navigation bar for mobile viewports
 */
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, Dumbbell, Bot, User, BookOpen } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Home',    path: '/dashboard' },
  { icon: BarChart3,      label: 'Stats',   path: '/analytics' },
  { icon: Dumbbell,       label: 'Workouts', path: '/workouts' },
  { icon: BookOpen,       label: 'Guides',   path: '/exercises' },
  { icon: Bot,            label: 'AI',       path: '/ai-coach' },
  { icon: User,           label: 'Profile',  path: '/profile' },
];

export default function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 pb-safe"
      style={{
        background: 'linear-gradient(180deg, rgba(26,22,46,0.97) 0%, rgba(18,15,36,0.99) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1.5px solid rgba(139,92,246,0.5)',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.7), 0 -1px 0 rgba(139,92,246,0.3)',
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl
              transition-all duration-200 min-w-[52px]
              ${isActive ? 'text-violet-400' : 'text-slate-200'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-xl -z-10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(139,92,246,0.15) 100%)',
                      border: '1px solid rgba(139,92,246,0.35)',
                      boxShadow: '0 0 16px rgba(124,58,237,0.25)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.7))' } : {}}
                  />
                </motion.div>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={isActive ? { textShadow: '0 0 8px rgba(167,139,250,0.5)' } : {}}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
