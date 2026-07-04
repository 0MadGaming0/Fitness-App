import { motion, AnimatePresence } from 'framer-motion';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import {
  Award, Trophy, Clock, Flame, Zap, Share2, X, Star
} from 'lucide-react';
import Modal from '../ui/Modal';
import Confetti from '../ui/Confetti';
import toast from 'react-hot-toast';

export default function WorkoutSummaryModal() {
  const { summaryData, setSummaryData } = useActiveWorkout();

  if (!summaryData) return null;

  const durationMins = Math.round(summaryData.duration / 60);

  const handleShare = () => {
    const text = `💪 Just finished a workout on FitAI!
🏋️ Exercise: ${summaryData.exercise}
⏱️ Duration: ${durationMins} mins
🔥 Calories: ${summaryData.calories} kcal
✨ XP Earned: +${summaryData.xp_earned} XP
🏆 Level: ${summaryData.level}
${summaryData.is_pr ? '⭐ NEW PERSONAL RECORD LIFTED! ⭐\n' : ''}
Join me and build daily consistency!`;

    navigator.clipboard.writeText(text);
    toast.success('Workout summary copied to clipboard! Share it with friends! 🚀');
  };

  return (
    <>
      {/* Trigger active confetti for 6 seconds when summary is opened */}
      <Confetti active={!!summaryData} duration={6000} />

      <Modal
        isOpen={!!summaryData}
        onClose={() => setSummaryData(null)}
        title="🎉 Workout Completed!"
        size="md"
      >
        <div className="flex flex-col items-center text-center p-6 gap-6 font-sans">
          
          {/* Big Crown/Trophy graphic */}
          <motion.div
            initial={{ scale: 0.6, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          >
            <Trophy size={42} className="animate-bounce" />
          </motion.div>

          {/* Congratulations header */}
          <div>
            <h2 className="text-xl font-black text-white leading-tight">Excellent job!</h2>
            <p className="text-slate-400 text-xs mt-1">You just crushed your {summaryData.exercise} workout.</p>
          </div>

          {/* Grid statistics (Features 1 & 14) */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="bg-white/03 border border-white/06 rounded-2xl p-3 flex flex-col items-center">
              <Clock size={16} className="text-violet-400 mb-1" />
              <span className="text-lg font-bold text-white leading-tight">{durationMins}m</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Duration</span>
            </div>
            <div className="bg-white/03 border border-white/06 rounded-2xl p-3 flex flex-col items-center">
              <Flame size={16} className="text-pink-400 mb-1" />
              <span className="text-lg font-bold text-white leading-tight">{summaryData.calories}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Calories</span>
            </div>
            <div className="bg-white/03 border border-white/06 rounded-2xl p-3 flex flex-col items-center">
              <Zap size={16} className="text-yellow-400 mb-1" />
              <span className="text-lg font-bold text-white leading-tight">+{summaryData.xp_earned}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">XP Gained</span>
            </div>
          </div>

          {/* Level Upgrade visual (Feature 7) */}
          <div className="w-full bg-white/02 border border-white/05 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Fitness Level</p>
              <h4 className="text-base font-extrabold text-white mt-0.5">Level {summaryData.level}</h4>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
              <Star size={20} className="fill-violet-400" />
            </div>
          </div>

          {/* Personal Record display (Feature 13) */}
          {summaryData.is_pr && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full bg-gradient-to-r from-amber-600/25 to-yellow-600/15 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-left"
            >
              <span className="text-2xl">⭐</span>
              <div>
                <h4 className="text-sm font-black text-amber-300">New Personal Record!</h4>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  You set a new max weight record in {summaryData.exercise}! Keep it up.
                </p>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={handleShare}
              className="
                flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl
                bg-white/05 border border-white/08 text-slate-300 hover:text-white
                font-bold text-sm hover:bg-white/10 transition-all cursor-pointer
              "
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
            <button
              onClick={() => setSummaryData(null)}
              className="
                flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm
                bg-gradient-to-r from-violet-600 to-cyan-500
                shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:opacity-90
                transition-all cursor-pointer border-none
              "
            >
              Close
            </button>
          </div>

        </div>
      </Modal>
    </>
  );
}
