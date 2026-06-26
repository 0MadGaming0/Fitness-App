/**
 * MobileNav.jsx — Bottom navigation bar for mobile viewports
 */
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, Dumbbell, Bot, User } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Home',    path: '/dashboard' },
  { icon: BarChart3,      label: 'Stats',   path: '/analytics' },
  { icon: Dumbbell,       label: 'Workouts', path: '/workouts' },
  { icon: Bot,            label: 'AI',       path: '/ai-coach' },
  { icon: User,           label: 'Profile',  path: '/profile' },
];

export default function MobileNav() {
  return (
    <nav className="
      md:hidden fixed bottom-0 inset-x-0 z-40
      glass border-t border-white/08
      px-2 pb-safe
    ">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl
              transition-all duration-200 min-w-[56px]
              ${isActive ? 'text-violet-400' : 'text-slate-500'}
            `}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 bg-violet-600/15 rounded-xl -z-10"
                    />
                  )}
                  <item.icon size={20} />
                </motion.div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
