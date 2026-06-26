/**
 * Card.jsx — Glassmorphism card container with hover animations
 */
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = true,
  glow = false,
  animate = true,
  delay = 0,
  onClick,
  ...props
}) {
  const baseClass = `
    glass rounded-2xl p-6
    ${glow ? 'pulse-glow' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  if (!animate) {
    return (
      <div className={baseClass} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hover ? {
        y: -2,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)',
        transition: { duration: 0.2 }
      } : {}}
      onClick={onClick}
      className={baseClass}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Compact stat card with icon + value */
export function StatCard({ icon, label, value, trend, color = 'violet', delay = 0 }) {
  const colorMap = {
    violet: 'from-violet-600/20 to-violet-900/10 border-violet-500/20 text-violet-400',
    cyan:   'from-cyan-600/20 to-cyan-900/10 border-cyan-500/20 text-cyan-400',
    blue:   'from-blue-600/20 to-blue-900/10 border-blue-500/20 text-blue-400',
    pink:   'from-pink-600/20 to-pink-900/10 border-pink-500/20 text-pink-400',
    green:  'from-green-600/20 to-green-900/10 border-green-500/20 text-green-400',
    orange: 'from-orange-600/20 to-orange-900/10 border-orange-500/20 text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`
        relative rounded-2xl p-6 border
        bg-gradient-to-br ${colorMap[color]}
        overflow-hidden
      `}
    >
      {/* Subtle glow circle */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-2xl bg-current" />

      <div className="relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-current/10 ${colorMap[color].split(' ').at(-1)}`}>
          {icon}
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider" style={{ marginBottom: '8px', lineHeight: '1.4' }}>{label}</p>
        <p className="text-3xl font-black text-white" style={{ lineHeight: '1.2' }}>{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.text}
          </p>
        )}
      </div>
    </motion.div>
  );
}
