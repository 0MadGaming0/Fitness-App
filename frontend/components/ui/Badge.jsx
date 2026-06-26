/**
 * Badge.jsx — Achievement badge component with animations
 */
import { motion } from 'framer-motion';

const rarityColors = {
  common:    'from-slate-600 to-slate-700 border-slate-500/30',
  uncommon:  'from-green-700 to-green-900 border-green-500/30',
  rare:      'from-blue-700 to-blue-900 border-blue-500/30',
  epic:      'from-violet-700 to-violet-900 border-violet-500/30',
  legendary: 'from-yellow-600 to-orange-700 border-yellow-500/30',
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
      whileHover={{ scale: 1.05, y: -3 }}
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-2xl
        border bg-gradient-to-br
        ${earned ? rarityColors[rarity] : 'from-slate-800 to-slate-900 border-slate-700/30'}
        ${!earned ? 'opacity-40 grayscale' : ''}
        transition-all duration-300 cursor-pointer
      `}
    >
      {/* Glow effect for earned badges */}
      {earned && (
        <div className="absolute inset-0 rounded-2xl opacity-20 blur-lg bg-current" />
      )}

      {/* Badge icon */}
      <motion.div
        animate={earned ? { rotate: [0, -5, 5, 0] } : {}}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
        className={`relative text-3xl w-14 h-14 flex items-center justify-center rounded-xl
          ${earned ? 'bg-white/10' : 'bg-white/5'}
        `}
      >
        {icon}
      </motion.div>

      <p className="text-xs font-bold text-center text-white leading-tight">{name}</p>
      {description && (
        <p className="text-[10px] text-slate-400 text-center leading-tight">{description}</p>
      )}

      {!earned && (
        <span className="text-[10px] font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          Locked
        </span>
      )}
    </motion.div>
  );
}
