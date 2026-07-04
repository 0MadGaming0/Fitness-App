/**
 * NotFound.jsx — Creative animated 404 page
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Dumbbell } from 'lucide-react';
import Button from '../components/ui/Button';
import PageTransition from '../components/layout/PageTransition';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="blob w-96 h-96 bg-violet-800 top-0 -left-32 absolute opacity-10" />
        <div className="blob blob-delay-4 w-72 h-72 bg-cyan-800 bottom-0 -right-16 absolute opacity-10" />

        <div className="relative text-center max-w-lg">
          {/* Animated dumbbells */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <motion.div
              animate={{ rotate: [-15, 15, -15], y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl opacity-50"
            >
              🏋️
            </motion.div>

            {/* 404 */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="relative">
                <span className="text-[100px] sm:text-[140px] font-black leading-none select-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  404
                </span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500"
                />
              </div>
            </motion.div>

            <motion.div
              animate={{ rotate: [15, -15, 15], y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="text-5xl opacity-50"
            >
              🏋️
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-black text-white mb-3">Workout not found!</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Looks like you skipped leg day and wandered into the wrong gym.
              This page doesn't exist, but your gains do.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/">
                <Button variant="primary" icon={<Home size={16} />}>
                  Back to Home
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" icon={<Dumbbell size={16} />}>
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Motivational sub-text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-slate-700 mt-10"
          >
            Error 404 · Page Not Found · Don't skip workouts though 💪
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
