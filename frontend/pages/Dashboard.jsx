/**
 * Dashboard.jsx — Main app dashboard with stats, quick actions, recent workouts
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell, Flame, Zap, Bot, Target, TrendingUp,
  Calendar, Trophy, Plus, ArrowRight, Star, PlayCircle, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../hooks/useWorkouts';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import { StatCard } from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Skeleton';
import ProgressRing from '../components/ui/ProgressRing';
import WeeklyBarChart from '../components/charts/WeeklyBarChart';
import { getDashboardSummary, getDetailedAnalytics, getNotifications } from '../services/workoutService';

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
  const { workouts, fetchWorkouts } = useWorkouts();
  const { startWorkout } = useActiveWorkout();

  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState(null);
  const [notificationsList, setNotificationsList] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
    const loadData = async () => {
      try {
        const [sumRes, detRes, notRes] = await Promise.all([
          getDashboardSummary(),
          getDetailedAnalytics(),
          getNotifications()
        ]);
        setSummary(sumRes.data);
        setDetails(detRes.data);
        setNotificationsList(notRes.data);
      } catch (err) {
        console.error('Error loading dashboard statistics:', err);
      } finally {
        setDbLoading(false);
      }
    };
    loadData();
  }, [fetchWorkouts]);

  // Compute weekly chart locally or from workouts list
  const stats = computeStats(workouts);

  // Daily Quote (stable change daily)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  // Read values
  const currentStreak = summary?.streak || 0;
  const bestStreak = summary?.longest_streak || 0;
  const xp = summary?.xp || 0;
  const level = summary?.level || 1;
  const xpInCurrentLevel = xp % 500;
  const xpProgressPct = Math.round((xpInCurrentLevel / 500) * 100);

  const totalCompleted = details?.total_workouts || 0;
  const totalCalories = details?.total_calories || 0;
  const totalHours = details?.total_hours || 0;
  const totalSets = details?.total_sets || 0;

  const weeklyGoalTarget = summary?.goal?.target || 5;
  const weeklyGoalCurrent = summary?.goal?.current || 0;
  const weeklyGoalPct = summary?.goal?.progress_pct || 0;

  const nextPlanned = summary?.next_planned;

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
      <div className="flex bg-[var(--bg-app)]" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px,4vw,48px) clamp(12px,4vw,40px) 80px', display: 'flex', flexDirection: 'column', gap: 'clamp(16px,3vw,40px)' }}>

            {/* Header Greeting + XP Tracker (Feature 7) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative glass rounded-2xl md:rounded-3xl overflow-hidden"
              style={{ padding: 'clamp(12px, 3vw, 32px) clamp(12px, 4vw, 40px)' }}
            >
              <div className="blob animate-blob w-72 h-72 bg-violet-800 -top-20 -right-20 absolute opacity-15" />
              <div className="blob animate-blob w-48 h-48 bg-cyan-800 bottom-0 right-1/3 absolute opacity-10" />

              <div className="relative flex flex-col md:flex-row md:items-center justify-between" style={{ gap: '12px' }}>
                <div className="flex-1 min-w-0">

                  {/* Mobile: greeting + streak side-by-side */}
                  <div className="flex items-center justify-between md:block">
                    <div>
                      <p className="text-slate-400 text-xs md:text-sm mb-0.5">{greeting} 👋</p>
                      <h1 className="text-xl md:text-4xl font-black text-white mb-0 md:mb-2">
                        {user?.name?.split(' ')[0] || 'Athlete'}!
                      </h1>
                    </div>
                    {/* Streak badge — inline on mobile, hidden here on desktop */}
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="flex md:hidden items-center gap-1.5 glass-strong rounded-xl px-2.5 py-1.5 border border-orange-500/20"
                    >
                      <span className="text-lg">🔥</span>
                      <div>
                        <p className="text-base font-black text-white leading-none">{currentStreak}</p>
                        <p className="text-[9px] text-slate-400">Streak</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bold Neon Daily Quote — compact strip on mobile, full block on desktop */}
                  {/* Mobile version */}
                  <div className="md:hidden mt-1.5 mb-2 px-2.5 py-1.5 bg-gradient-to-r from-violet-950/20 to-cyan-950/10 border border-violet-500/20 rounded-lg flex items-center gap-1.5 overflow-hidden">
                    <span className="text-fuchsia-400 text-[10px] flex-shrink-0">✦</span>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 font-bold italic text-[10px] truncate">
                      "{quote.text}" — {quote.author}
                    </p>
                  </div>
                  {/* Desktop version */}
                  <div className="hidden md:block mt-2.5 mb-4 p-4 bg-gradient-to-r from-violet-950/20 via-slate-900/10 to-cyan-950/10 border border-violet-500/20 rounded-2xl shadow-[0_0_20px_rgba(124,58,237,0.15)] max-w-xl">
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 font-extrabold italic text-base leading-relaxed drop-shadow-[0_0_8px_rgba(167,139,250,0.45)]">
                      "{quote.text}"
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">— {quote.author}</p>
                  </div>

                  {/* XP Bar */}
                  <div className="max-w-md mt-2 md:mt-4 font-sans">
                    <div className="flex justify-between text-[10px] md:text-xs mb-1 font-bold px-0.5">
                      <span className="text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]">Level {level}</span>
                      <span className="text-slate-400">{xpInCurrentLevel}/500 XP to Level {level + 1}</span>
                    </div>
                    <div className="w-full h-2 md:h-3.5 bg-white/05 border border-white/08 rounded-full overflow-hidden p-[2px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]"
                        style={{ width: `${xpProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Streak badge — desktop only */}
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="hidden md:flex items-center gap-3 glass-strong rounded-2xl px-5 py-4 border border-orange-500/20"
                >
                  <div className="text-3xl">🔥</div>
                  <div>
                    <p className="text-2xl font-black text-white">{currentStreak}</p>
                    <p className="text-xs text-slate-400 font-medium">Current Streak</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* ─── Stats Grid (Feature 8) ─── */}
            {dbLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Dumbbell size={18}/>} label="Total Completed"  value={totalCompleted}       color="violet" delay={0.05} />
                <StatCard icon={<Flame size={18}/>}    label="Calories Burned" value={`${totalCalories} kcal`} color="pink" delay={0.1} />
                <StatCard icon={<Calendar size={18}/>} label="Total Hours"     value={`${totalHours} h`}  color="cyan"   delay={0.15} />
                <StatCard icon={<Trophy size={18}/>}   label="Best Streak"     value={`${bestStreak} days`} color="orange" delay={0.2} />
              </div>
            )}

            {/* ─── Next Planned Workout Template card (Feature 1) ─── */}
            {nextPlanned && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-5 border border-violet-500/20 flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center text-violet-400">
                    <PlayCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Next Planned Workout</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {nextPlanned.exercise} — {nextPlanned.sets} sets × {nextPlanned.reps} reps
                      {nextPlanned.weight !== undefined && nextPlanned.weight !== null ? ` @ ${nextPlanned.weight} kg` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startWorkout(
                    nextPlanned.exercise,
                    nextPlanned.sets,
                    nextPlanned.reps,
                    nextPlanned.weight !== undefined && nextPlanned.weight !== null ? nextPlanned.weight : 40
                  )}
                  className="
                    px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold
                    shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all cursor-pointer border-none
                  "
                >
                  Start Now
                </button>
              </motion.div>
            )}

            {/* ─── Middle Row (Feature 8, 10) ─── */}
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

              {/* Weekly Goals Progress Ring (Feature 10) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-4"
              >
                <h3 className="font-bold text-white self-start">Weekly Goals</h3>
                <ProgressRing
                  progress={weeklyGoalPct}
                  size={140}
                  strokeWidth={10}
                  color="#22d3ee"
                  label={`${weeklyGoalPct}%`}
                  sublabel="Complete"
                />
                <div className="text-center font-sans">
                  <p className="text-xs text-slate-400">
                    Workout Goal: {Math.round(weeklyGoalCurrent)} / {Math.round(weeklyGoalTarget)} days
                  </p>
                  <p className="text-xs text-cyan-400 mt-1 font-semibold">
                    {weeklyGoalCurrent >= weeklyGoalTarget ? 'Weekly target reached! 🎉' : `${Math.round(weeklyGoalTarget - weeklyGoalCurrent)} workouts left to goal`}
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

            <div className="grid md:grid-cols-2 gap-8">
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

                {dbLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 shimmer rounded-xl bg-white/[0.03]" />
                    ))}
                  </div>
                ) : !summary?.recent_completed || summary.recent_completed.length === 0 ? (
                  <div className="text-center py-10 font-sans">
                    <Dumbbell size={40} className="text-slate-700 mx-auto mb-3 animate-bounce" />
                    <p className="text-slate-500 text-sm">No completed workouts yet.</p>
                    <Link to="/workouts">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        className="mt-3 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto font-bold cursor-pointer"
                      >
                        <Plus size={12} /> Log your first workout
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 font-sans">
                    {summary.recent_completed.map((w, i) => (
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
                            <p className="text-xs text-slate-500">{w.sets} sets × {w.reps} reps @ {w.weight}kg</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar size={11} className="text-slate-500" />
                          <span>{w.completed_at || 'Just Now'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* ─── Smart Notifications Feed (Feature 12) ─── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Bell className="text-violet-400 animate-pulse" size={16} />
                    Notifications Feed
                  </h3>
                  <span className="text-xs text-slate-500">Real-time alerts</span>
                </div>

                {dbLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 shimmer rounded-xl bg-white/[0.03]" />
                    ))}
                  </div>
                ) : notificationsList.length === 0 ? (
                  <div className="text-center py-10 font-sans">
                    <Bell size={40} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">All caught up! No notifications.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 font-sans overflow-y-auto max-h-[220px] pr-1">
                    {notificationsList.map((n, i) => (
                      <motion.div
                        key={n._id || i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/04 hover:border-white/08 transition-all"
                      >
                        <p className="text-xs font-semibold text-slate-200 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

          </div>
        </main>

        <MobileNav />
      </div>
    </PageTransition>
  );
}
