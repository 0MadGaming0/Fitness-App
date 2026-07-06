import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { Link } from 'react-router-dom';
import {
  Dumbbell, Play, Pause, Square, CheckSquare,
  ChevronDown, ChevronUp, Clock, Flame, PlayCircle, BookOpen
} from 'lucide-react';
import Button from '../ui/Button';

// Format seconds into MM:SS
const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function ActiveWorkoutWidget() {
  const {
    activeSession,
    secondsElapsed,
    restTimeLeft,
    restTimeTotal,
    restActive,
    toggleSet,
    skipRest,
    finishActiveWorkout,
    skipActiveWorkout,
    cheatingWarning,
  } = useActiveWorkout();

  const [expanded, setExpanded] = useState(false);
  const [actualWeight, setActualWeight] = useState('');
  const [actualReps, setActualReps] = useState('');

  // Sync actual weight/reps with active session default on load
  useEffect(() => {
    if (activeSession) {
      setActualWeight(activeSession.weight || '');
      setActualReps(activeSession.reps || '');
    }
  }, [activeSession]);

  if (!activeSession) return null;

  const totalSets = activeSession.sets || 0;
  const completedSetsArray = activeSession.completed_sets || [];
  const completedSetsCount = completedSetsArray.filter(Boolean).length;
  const progressPct = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;

  // Active rest calculation
  const restPct = restTimeTotal > 0 ? Math.round((restTimeLeft / restTimeTotal) * 100) : 0;

  return (
    <div className="fixed bottom-[88px] md:bottom-6 right-3 md:right-6 z-50 w-[calc(100%-24px)] md:max-w-sm md:w-full font-sans">
      <AnimatePresence mode="wait">
        {!expanded ? (
          /* ─── COLLAPSED MINIFIED FLOATING WIDGET ─── */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={() => setExpanded(true)}
            className="
              glass-strong p-4 rounded-2xl border border-violet-500/30
              shadow-[0_8px_32px_rgba(124,58,237,0.25)]
              flex items-center justify-between cursor-pointer hover:border-violet-500/50
              transition-all duration-300
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 animate-pulse">
                <Dumbbell size={18} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm truncate max-w-[150px] leading-tight">
                  {activeSession.exercise}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Clock size={11} className="text-slate-500" />
                  {formatTime(secondsElapsed)}
                  <span className="text-violet-400">•</span>
                  <span>{completedSetsCount}/{totalSets} Sets</span>
                </p>
              </div>
            </div>

            {/* Circular Progress Indicator */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" fill="transparent" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="var(--color-violet-400)"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 * (1 - progressPct / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <ChevronUp size={14} className="absolute text-violet-400" />
            </div>
          </motion.div>
        ) : (
          /* ─── EXPANDED DETAILED DRAWER WIDGET ─── */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="
              glass-strong p-5 rounded-3xl border border-white/10
              shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col gap-4
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/06">
              <div className="flex items-center gap-2">
                <Dumbbell className="text-violet-400" size={16} />
                <span className="text-xs uppercase tracking-wider font-extrabold text-violet-400">
                  Active Workout
                </span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/08 transition-all"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Workout title & duration */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
                  {activeSession.exercise}
                  <Link
                    to={`/exercises?q=${encodeURIComponent(activeSession.exercise)}`}
                    className="p-1 rounded-md text-violet-400 hover:text-violet-300 hover:bg-white/05 transition-all"
                    title="View form guide"
                  >
                    <BookOpen size={12} />
                  </Link>
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Flame size={12} className="text-pink-400" />
                  Estimated: {intCaloriesEstimate(completedSetsCount, secondsElapsed)} kcal
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm font-mono font-bold text-white bg-white/05 px-2.5 py-1.5 rounded-xl border border-white/06">
                <Clock size={13} className="text-slate-400" />
                {formatTime(secondsElapsed)}
              </div>
            </div>

            {/* Progress Bar (Feature 3) */}
            <div className="bg-white/[0.02] rounded-2xl p-3 border border-white/04">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-bold">
                <span>Workout Progress</span>
                <span className="text-violet-400">{progressPct}% ({completedSetsCount}/{totalSets})</span>
              </div>
              <div className="w-full h-2 bg-white/08 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Checklist of Sets (Feature 2) */}
            <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
              {Array.from({ length: totalSets }).map((_, idx) => {
                const isChecked = completedSetsArray[idx];
                return (
                  <div
                    key={idx}
                    className={`
                      flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200
                      ${isChecked
                        ? 'bg-violet-950/10 border-violet-500/20 text-white'
                        : 'bg-white/[0.01] border-white/05 text-slate-400'
                      }
                    `}
                  >
                    <span className="text-xs font-semibold">Set {idx + 1}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {activeSession.reps} Reps @ {activeSession.weight}kg
                      </span>
                      <button
                        onClick={() => toggleSet(idx, !isChecked)}
                        className={`
                          w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer
                          ${isChecked
                            ? 'bg-violet-500 text-white shadow-[0_0_8px_rgba(124,58,237,0.3)]'
                            : 'border border-slate-600 hover:border-slate-400'
                          }
                        `}
                      >
                        {isChecked && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3.5 h-3.5 stroke-current stroke-2"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rest Timer display (Feature 4) */}
            <AnimatePresence>
              {restActive && restTimeLeft > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-cyan-950/10 border border-cyan-500/20 rounded-2xl p-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-bold mb-1.5">
                    <span className="flex items-center gap-1">⏱️ Rest Timer</span>
                    <span>{restTimeLeft}s remaining</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/05 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-1000"
                      style={{ width: `${restPct}%` }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={skipRest}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold cursor-pointer"
                    >
                      Skip Rest
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weight/Reps Override Form */}
            <div className="grid grid-cols-2 gap-2 pb-1">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Set Weight (kg)</label>
                <input
                  type="number"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  className="w-full bg-white/03 border border-white/08 rounded-lg px-2 py-1 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Set Reps</label>
                <input
                  type="number"
                  value={actualReps}
                  onChange={(e) => setActualReps(e.target.value)}
                  className="w-full bg-white/03 border border-white/08 rounded-lg px-2 py-1 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Finish/Skip buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {cheatingWarning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 font-extrabold rounded-xl text-[11px] text-center flex items-center justify-center gap-2 leading-relaxed"
                >
                  🚫 {cheatingWarning}
                </motion.div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={skipActiveWorkout}
                  style={{ py: '10px' }}
                >
                  Skip / Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={completedSetsCount < totalSets}
                  onClick={() => finishActiveWorkout(parseInt(actualWeight, 10), parseInt(actualReps, 10))}
                  style={{ py: '10px' }}
                >
                  Finish Workout
                </Button>
              </div>
              {completedSetsCount < totalSets && !cheatingWarning && (
                <p className="text-[10px] text-amber-400 font-extrabold text-center flex items-center justify-center gap-1 bg-amber-500/10 border border-amber-500/20 py-1.5 rounded-lg">
                  ⚠️ Complete all sets ({completedSetsCount}/{totalSets}) to finish workout
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helpers
function intCaloriesEstimate(sets, seconds) {
  return Math.round(sets * 10 * 0.2 + (seconds || 0) * 0.05);
}
