/**
 * Badge.jsx — Achievement badge component with theme adaptivity.
 * Earned badges use vibrant premium rarity gradients with white text.
 * Locked badges blend with the current theme (light/dark) for clean readability.
 */
import { motion } from 'framer-motion';

const rarityColors = {
  common:    'from-slate-600 to-slate-700 border-slate-500/20 shadow-sm',
  uncommon:  'from-emerald-600 to-emerald-800 border-emerald-500/20 shadow-md shadow-emerald-500/10',
  rare:      'from-blue-600 to-blue-800 border-blue-500/20 shadow-md shadow-blue-500/10',
  epic:      'from-violet-600 to-violet-800 border-violet-500/20 shadow-md shadow-violet-500/10',
  legendary: 'from-amber-500 to-orange-600 border-amber-400/20 shadow-lg shadow-amber-500/20',
};

export default function Badge({
  icon,
  name,
  description,
  earned = false,
  rarity = 'common',
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={`
        relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer
        ${earned
          ? `bg-gradient-to-br ${rarityColors[rarity]} text-white shine-effect shadow-md`
          : 'bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] opacity-50 grayscale hover:opacity-80 hover:grayscale-0'
        }
      `}
    >
      {/* Subtle background glow effect for earned premium badges */}
      {earned && (rarity === 'epic' || rarity === 'legendary') && (
        <div className="absolute inset-0 rounded-2xl opacity-15 blur-lg bg-white" />
      )}

      {/* Badge icon container */}
      <motion.div
        animate={earned ? { rotate: [0, -6, 6, 0] } : {}}
        whileHover={earned ? { rotate: [-10, 10, -10, 10, 0], scale: 1.12 } : { scale: 1.06 }}
        transition={{ duration: 0.6, delay: earned ? delay + 0.3 : 0 }}
        className={`relative text-2xl w-12 h-12 flex items-center justify-center rounded-xl transition-colors
          ${earned ? 'bg-white/12' : 'bg-[var(--hover-bg)]'}
        `}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <p className={`text-xs font-bold text-center leading-tight transition-colors
        ${earned ? 'text-white' : 'text-[var(--text-primary)]'}
      `}>
        {name}
      </p>

      {/* Description */}
      {description && (
        <p className={`text-[10px] text-center leading-tight transition-colors
          ${earned ? 'text-slate-200' : 'text-[var(--text-muted)]'}
        `}>
          {description}
        </p>
      )}

      {/* Status indicator */}
      {!earned && (
        <span className="text-[9px] font-semibold text-[var(--text-muted)] bg-[var(--hover-bg)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-full mt-1">
          Locked
        </span>
      )}
    </motion.div>
  );
}
