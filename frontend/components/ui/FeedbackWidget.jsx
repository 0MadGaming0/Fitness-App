import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, X, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { submitFeedback } from '../../services/workoutService';
import Button from './Button';
import toast from 'react-hot-toast';

export default function FeedbackWidget() {
  const { isAuthenticated } = useAuth();
  const { activeSession } = useActiveWorkout();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState('Praise & Love');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // If not authenticated, do not show feedback widget
  if (!isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write some comments before submitting!');
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({
        type: feedbackType,
        comment: comment.trim(),
        rating
      });
      toast.success('Feedback submitted! Thank you for making FitAI better! ❤️');
      setComment('');
      setRating(5);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Action Button */}
      <div className={`fixed ${activeSession ? 'bottom-24' : 'bottom-6'} right-6 z-40 font-sans transition-all duration-300`}>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          className="
            w-12 h-12 rounded-full bg-slate-900 border border-violet-500/30 text-violet-400
            flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.25)]
            hover:border-violet-500 hover:text-white transition-all
          "
          title="Provide Feedback"
        >
          <MessageSquare size={20} />
        </motion.button>
      </div>

      {/* Pop-up Glassmorphic Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="
                glass rounded-3xl border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)]
                p-6 max-w-md w-full relative overflow-hidden text-white
              "
            >
              {/* Radial gradient background accent */}
              <div className="absolute w-56 h-56 bg-violet-600/10 rounded-full blur-[80px] -top-10 -left-10 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="
                  absolute right-4 top-4 p-1.5 rounded-lg bg-white/03 hover:bg-white/08
                  text-slate-400 hover:text-white border border-white/05 cursor-pointer
                "
              >
                <X size={14} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2 mb-4">
                <Heart className="text-violet-400 fill-current" size={18} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Share Your Experience</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">Give Feedback</h3>
              <p className="text-xs text-slate-400 mb-5">
                Tell us what you love, report a bug, or suggest features you'd like to see next!
              </p>

              {/* Feedback Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
                
                {/* Stars Rating Select */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-1.5">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition-all hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={`
                            ${star <= rating 
                              ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' 
                              : 'text-slate-600'
                            }
                          `}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropdown Select Type */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-1.5">Category</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="
                      w-full bg-white/03 border border-white/08 rounded-xl py-2.5 px-3.5
                      text-xs text-white focus:border-violet-500 outline-none cursor-pointer
                    "
                  >
                    <option value="Praise & Love" className="bg-slate-900 text-white">Praise & Love ❤️</option>
                    <option value="Bug Report" className="bg-slate-900 text-white">Bug Report 🐛</option>
                    <option value="Feature Suggestion" className="bg-slate-900 text-white">Feature Suggestion 🚀</option>
                    <option value="UI/UX Suggestion" className="bg-slate-900 text-white">UI/UX Layout design 🎨</option>
                  </select>
                </div>

                {/* Feedback Comment Text Area */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-1.5">Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Write your feedback details here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="
                      w-full bg-white/03 border border-white/08 focus:border-violet-500
                      rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none
                      resize-none transition-all
                    "
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    type="submit"
                    loading={loading}
                  >
                    Submit Feedback
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
