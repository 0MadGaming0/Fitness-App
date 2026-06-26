/**
 * Dashboard.jsx — Main app dashboard with stats, quick actions, recent workouts
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell, Flame, Zap, Bot, Target, TrendingUp,
  Calendar, Trophy, Plus, ArrowRight, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../hooks/useWorkouts';
import { useCountUp } from '../hooks/useCountUp';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import { StatCard } from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Skeleton';
import ProgressRing from '../components/ui/ProgressRing';
import WeeklyBarChart from '../components/charts/WeeklyBarChart';

// Daily motivational quotes
const QUOTES = [
  { text: 'The only bad workout is the one that didn\'t happen.', author: 'Unknown' },
  { text: 'Push yourself because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Your body can stand almost anything. It\'s your mind you have to convince.', author: 'Unknown' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'Take care of your body. It\'s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Arnold Schwarzenegger' },
  { text: 'Results happen over time, not overnight. Work hard, stay consistent.', author: 'Unknown' },
];

// Compute stats from workout list
function computeStats(workouts) {
  const total = workouts.length;
  // Estimate calories: avg 150 kcal per workout session
  const calories = total * 150;
  // Active days = unique dates
  const dates = new Set(workouts.map((w) => {
    if (!w.created_at) return '';
    return new Date(w.created_at).toDateString();
  }));
  const activeDays = dates.size;

  // Weekly data (last 7 days)
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const count = workouts.filter((w) => w.created_at && new Date(w.created_at).toDateString() === dayStr).length;
    weeklyData.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      workouts: count,
    });
  }

  // Streak calculation
  let streak = 0;
  const sortedDates = [...dates].filter(Boolean).sort((a, b) => new Date(b) - new Date(a));
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
  if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
    streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (prev - curr) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
  }

  return { total, calories, activeDays, streak, weeklyData };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { workouts, loading, fetchWorkouts } = useWorkouts();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);

  const stats = computeStats(workouts);
  const recentWorkouts = workouts.slice(-5).reverse();
  const goalProgress = Math.min(Math.round((stats.total / 30) * 100), 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    { icon: Plus,       label: 'Log Workout', path: '/workouts',  color: 'violet' },
    { icon: Bot,        label: 'Ask AI Coach', path: '/ai-coach',  color: 'cyan' },
    { icon: TrendingUp, label: 'View Analytics',path: '/analytics', color: 'blue' },
    { icon: Target,     label: 'Edit Goals',   path: '/profile',   color: 'pink' },
  ];

  return (
    <PageTransition>
      <div className="flex bg-[#050508]" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative glass rounded-3xl overflow-hidden"
              style={{ padding: '32px 40px' }}
            >
              <div className="blob animate-blob w-72 h-72 bg-violet-800 -top-20 -right-20 absolute opacity-15" />
              <div className="blob animate-blob w-48 h-48 bg-cyan-800 bottom-0 right-1/3 absolute opacity-10" />

              <div className="relative flex flex-col md:flex-row md:items-center justify-between" style={{ gap: '24px' }}>
                <div>
                  <p className="text-slate-400 text-sm mb-1">{greeting} 👋</p>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
                    {user?.name?.split(' ')[0] || 'Athlete'}!
                  </h1>
                  <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                    "{quote.text}"
                    <span className="text-slate-600 ml-2">— {quote.author}</span>
                  </p>
                </div>

                {/* Streak badge */}
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex items-center gap-3 glass-strong rounded-2xl px-5 py-4 border border-orange-500/20"
                >
                  <div className="text-3xl">🔥</div>
                  <div>
                    <p className="text-2xl font-black text-white">{stats.streak}</p>
                    <p className="text-xs text-slate-400">Day Streak</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* ─── Stats Grid ─── */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Dumbbell size={18}/>} label="Total Workouts"  value={stats.total}       color="violet" delay={0.05} />
                <StatCard icon={<Flame size={18}/>}    label="Calories Burned" value={`${stats.calories}kcal`} color="pink" delay={0.1} />
                <StatCard icon={<Calendar size={18}/>} label="Active Days"     value={stats.activeDays}  color="cyan"   delay={0.15} />
                <StatCard icon={<Trophy size={18}/>}   label="Best Streak"     value={`${stats.streak}d`} color="orange" delay={0.2} />
              </div>
            )}

            {/* ─── Middle Row ─── */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Weekly Chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Weekly Activity</h3>
                  <span className="text-xs text-slate-500">Last 7 days</span>
                </div>
                <WeeklyBarChart data={stats.weeklyData} />
              </motion.div>

              {/* Goal Progress */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-4"
              >
                <h3 className="font-bold text-white self-start">Monthly Goal</h3>
                <ProgressRing
                  progress={goalProgress}
                  size={140}
                  strokeWidth={10}
                  color="#7c3aed"
                  label={`${goalProgress}%`}
                  sublabel="Complete"
                />
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    {stats.total} / 30 workouts
                  </p>
                  <p className="text-xs text-violet-400 mt-1 font-medium">
                    {Math.max(0, 30 - stats.total)} to go this month
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ─── Quick Actions ─── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, i) => (
                  <Link key={i} to={action.path}>
                    <motion.div
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`
                        glass rounded-2xl p-4 flex flex-col items-center gap-2.5
                        border border-transparent hover:border-white/10
                        transition-colors cursor-pointer
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        ${action.color === 'violet' ? 'bg-violet-600/20 text-violet-400' : ''}
                        ${action.color === 'cyan'   ? 'bg-cyan-600/20 text-cyan-400' : ''}
                        ${action.color === 'blue'   ? 'bg-blue-600/20 text-blue-400' : ''}
                        ${action.color === 'pink'   ? 'bg-pink-600/20 text-pink-400' : ''}
                      `}>
                        <action.icon size={18} />
                      </div>
                      <span className="text-xs font-medium text-slate-300 text-center">{action.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* ─── Recent Workouts ─── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Recent Workouts</h3>
                <Link to="/workouts" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 shimmer rounded-xl bg-white/[0.03]" />
                  ))}
                </div>
              ) : recentWorkouts.length === 0 ? (
                <div className="text-center py-10">
                  <Dumbbell size={40} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No workouts yet.</p>
                  <Link to="/workouts">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      className="mt-3 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto"
                    >
                      <Plus size={12} /> Log your first workout
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentWorkouts.map((w, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/15 flex items-center justify-center">
                          <Dumbbell size={14} className="text-violet-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{w.exercise}</p>
                          <p className="text-xs text-slate-500">{w.sets} sets × {w.reps} reps</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Star size={10} className="text-yellow-500" fill="currentColor" />
                        <span>{w.sets * w.reps} vol</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </main>

        <MobileNav />
      </div>
    </PageTransition>
  );
}
