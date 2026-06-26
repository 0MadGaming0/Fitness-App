/**
 * WorkoutCard.jsx — Individual workout display card with edit/delete actions
 */
import { motion } from 'framer-motion';
import { Dumbbell, Edit2, Trash2, Clock, MoreVertical } from 'lucide-react';
import { useState } from 'react';

// Map exercise names to muscle groups for color coding
const getMuscleGroup = (exercise = '') => {
  const e = exercise.toLowerCase();
  if (e.includes('bench') || e.includes('chest') || e.includes('push')) return { label: 'Chest', color: 'violet' };
  if (e.includes('squat') || e.includes('leg') || e.includes('lunge')) return { label: 'Legs', color: 'cyan' };
  if (e.includes('pull') || e.includes('row') || e.includes('back') || e.includes('lat')) return { label: 'Back', color: 'blue' };
  if (e.includes('run') || e.includes('cardio') || e.includes('cycle') || e.includes('bike')) return { label: 'Cardio', color: 'pink' };
  if (e.includes('shoulder') || e.includes('press') || e.includes('ohp')) return { label: 'Shoulders', color: 'orange' };
  if (e.includes('curl') || e.includes('arm') || e.includes('tricep') || e.includes('bicep')) return { label: 'Arms', color: 'green' };
  return { label: 'General', color: 'slate' };
};

const colorMap = {
  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  cyan:   'text-cyan-400   bg-cyan-500/10   border-cyan-500/20',
  blue:   'text-blue-400   bg-blue-500/10   border-blue-500/20',
  pink:   'text-pink-400   bg-pink-500/10   border-pink-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  green:  'text-green-400  bg-green-500/10  border-green-500/20',
  slate:  'text-slate-400  bg-slate-500/10  border-slate-500/20',
};

export default function WorkoutCard({ workout, onEdit, onDelete, index = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const muscle = getMuscleGroup(workout.exercise);
  const colorClass = colorMap[muscle.color];

  const date = workout.created_at
    ? new Date(workout.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    : 'Today';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-5 relative group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
            <Dumbbell size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">
              {workout.exercise}
            </h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border mt-1 inline-block ${colorClass}`}>
              {muscle.label}
            </span>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="
              p-1.5 rounded-lg text-slate-500 hover:text-white
              hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100
            "
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-8 rounded-xl border border-white/10 shadow-2xl z-10 w-32 overflow-hidden"
              style={{ background: 'var(--bg-sidebar)' }}
              onBlur={() => setMenuOpen(false)}
            >
              <button
                onClick={() => { onEdit(workout); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/05 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => { onDelete(workout); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{workout.sets}</p>
          <p className="text-xs text-slate-500 mt-0.5">Sets</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{workout.reps}</p>
          <p className="text-xs text-slate-500 mt-0.5">Reps</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 mt-3 text-slate-500 text-xs">
        <Clock size={11} />
        <span>{date}</span>
      </div>
    </motion.div>
  );
}
