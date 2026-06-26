/**
 * Analytics.jsx — Fitness analytics with all Recharts + heatmap + achievements
 */
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Flame, TrendingUp, Target, Award,
  Dumbbell, Clock, Calendar, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../hooks/useWorkouts';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import { SkeletonCard } from '../components/ui/Skeleton';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';
import WeeklyBarChart from '../components/charts/WeeklyBarChart';
import MonthlyAreaChart from '../components/charts/MonthlyAreaChart';
import CaloriesLineChart from '../components/charts/CaloriesLineChart';
import WorkoutPieChart from '../components/charts/WorkoutPieChart';
import WeightLineChart from '../components/charts/WeightLineChart';
import WorkoutHeatmap from '../components/charts/WorkoutHeatmap';

// ─── BMI Calculator ───
function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = height / 100;
  const bmi = weight / (h * h);
  return Math.round(bmi * 10) / 10;
}

function getBMICategory(bmi) {
  if (!bmi) return { label: '—', color: 'text-slate-400' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25) return { label: 'Normal weight', color: 'text-green-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
  return { label: 'Obese', color: 'text-red-400' };
}

// Determine muscle group from exercise name
function getMuscle(exercise = '') {
  const e = exercise.toLowerCase();
  if (e.includes('bench') || e.includes('chest') || e.includes('push')) return 'Chest';
  if (e.includes('squat') || e.includes('leg') || e.includes('lunge')) return 'Legs';
  if (e.includes('pull') || e.includes('row') || e.includes('back') || e.includes('lat')) return 'Back';
  if (e.includes('run') || e.includes('cardio') || e.includes('cycle')) return 'Cardio';
  if (e.includes('shoulder') || e.includes('press') || e.includes('ohp')) return 'Shoulders';
  if (e.includes('curl') || e.includes('arm') || e.includes('tricep') || e.includes('bicep')) return 'Arms';
  return 'General';
}

// ─── Data derivation ───
function deriveAnalytics(workouts) {
  const total = workouts.length;

  // Weekly data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const count = workouts.filter((w) => {
      if (!w.created_at) return false;
      return new Date(w.created_at).toDateString() === d.toDateString();
    }).length;
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), workouts: count };
  });

  // Monthly data (last 8 weeks)
  const monthlyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = workouts.filter((w) => {
      if (!w.created_at) return false;
      const d = new Date(w.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    return {
      week: `Wk${i + 1}`,
      workouts: count,
    };
  });

  // Calories (estimated per workout session)
  const caloriesData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const count = workouts.filter((w) => {
      if (!w.created_at) return false;
      return new Date(w.created_at).toDateString() === d.toDateString();
    }).length;
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: count * 150 + Math.floor(Math.random() * 50),
    };
  });

  // Muscle group distribution
  const muscleCount = {};
  workouts.forEach((w) => {
    const m = getMuscle(w.exercise);
    muscleCount[m] = (muscleCount[m] || 0) + 1;
  });
  const pieData = Object.entries(muscleCount).map(([name, value]) => ({ name, value }));
  if (pieData.length === 0) {
    pieData.push(
      { name: 'Chest', value: 3 },
      { name: 'Legs', value: 4 },
      { name: 'Back', value: 3 },
      { name: 'Cardio', value: 2 },
    );
  }

  // Weight placeholder data (real data would come from profile entries)
  const weightData = Array.from({ length: 8 }, (_, i) => ({
    date: new Date(Date.now() - (7 - i) * 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: 75 + Math.sin(i / 2) * 1.5 - i * 0.1,
  }));

  // Max reps / sets records
  const maxReps = workouts.reduce((m, w) => Math.max(m, w.reps || 0), 0);
  const totalSets = workouts.reduce((m, w) => m + (w.sets || 0), 0);
  const totalHours = Math.round(total * 0.75 * 10) / 10;

  return { total, weeklyData, monthlyData, caloriesData, pieData, weightData, maxReps, totalSets, totalHours };
}

// ─── Achievement badge data ───
function getAchievements(total, streak) {
  return [
    { icon: '🏋️', name: 'First Workout', description: 'Complete 1 workout', rarity: 'uncommon', earned: total >= 1 },
    { icon: '🔥', name: '7-Day Streak', description: '7 days in a row', rarity: 'rare', earned: streak >= 7 },
    { icon: '💪', name: 'Strength Builder', description: 'Log 10 workouts', rarity: 'rare', earned: total >= 10 },
    { icon: '⚡', name: '30-Day Streak', description: '30 days in a row', rarity: 'epic', earned: streak >= 30 },
    { icon: '🎯', name: 'Consistency Master', description: '50 total workouts', rarity: 'epic', earned: total >= 50 },
    { icon: '🏆', name: 'Elite Athlete', description: '100 total workouts', rarity: 'legendary', earned: total >= 100 },
  ];
}

export default function Analytics() {
  const { user } = useAuth();
  const { workouts, loading, fetchWorkouts } = useWorkouts();

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);

  const analytics = useMemo(() => deriveAnalytics(workouts), [workouts]);
  const bmi = calcBMI(user?.weight, user?.height);
  const bmiCategory = getBMICategory(bmi);
  const bmiProgress = bmi ? Math.min(Math.round(((bmi - 10) / 30) * 100), 100) : 0;

  // Streak
  const dates = new Set(workouts.map((w) => w.created_at ? new Date(w.created_at).toDateString() : ''));
  const sortedDates = [...dates].filter(Boolean).sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
  if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
    streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (new Date(sortedDates[i - 1]) - new Date(sortedDates[i])) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
  }

  const achievements = getAchievements(analytics.total, streak);
  const goalCompletion = Math.min(Math.round((analytics.total / 30) * 100), 100);

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-[#050508]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <BarChart3 className="text-violet-400" size={22} />
                Analytics
              </h1>
              <p className="text-slate-500 text-sm mt-1">Detailed insights into your fitness journey</p>
            </motion.div>

            {/* ─── Top Stats ─── */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Dumbbell size={16} />, label: 'Total Workouts', value: analytics.total, color: 'violet' },
                  { icon: <Flame size={16} />, label: 'Calories Burned', value: `${analytics.total * 150}+`, color: 'pink' },
                  { icon: <Clock size={16} />, label: 'Hours Trained', value: `${analytics.totalHours}h`, color: 'cyan' },
                  { icon: <Activity size={16} />, label: 'Total Sets', value: analytics.totalSets, color: 'blue' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 text-slate-400 mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ─── Charts Row 1 ─── */}
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-5"
              >
                <h3 className="font-bold text-white mb-1">Weekly Workouts</h3>
                <p className="text-xs text-slate-500 mb-4">Workouts completed each day</p>
                <WeeklyBarChart data={analytics.weeklyData} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-5"
              >
                <h3 className="font-bold text-white mb-1">Monthly Progress</h3>
                <p className="text-xs text-slate-500 mb-4">Workout trend over 8 weeks</p>
                <MonthlyAreaChart data={analytics.monthlyData} />
              </motion.div>
            </div>

            {/* ─── Charts Row 2 ─── */}
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-5"
              >
                <h3 className="font-bold text-white mb-1">Calories Burned</h3>
                <p className="text-xs text-slate-500 mb-4">Estimated daily calories</p>
                <CaloriesLineChart data={analytics.caloriesData} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-5"
              >
                <h3 className="font-bold text-white mb-1">Workout Distribution</h3>
                <p className="text-xs text-slate-500 mb-2">Muscle groups targeted</p>
                <WorkoutPieChart data={analytics.pieData} />
              </motion.div>
            </div>

            {/* ─── BMI + Goal + Weight ─── */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* BMI Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-5 flex flex-col items-center gap-4"
              >
                <h3 className="font-bold text-white self-start">BMI Score</h3>
                <ProgressRing
                  progress={bmiProgress}
                  size={120}
                  strokeWidth={9}
                  color={bmi && bmi < 25 ? '#34d399' : bmi && bmi < 30 ? '#fbbf24' : '#f87171'}
                  label={bmi ? bmi.toString() : '—'}
                  sublabel="BMI"
                />
                <div className="text-center">
                  <p className={`font-semibold text-sm ${bmiCategory.color}`}>{bmiCategory.label}</p>
                  <p className="text-xs text-slate-500 mt-1">Healthy range: 18.5 – 24.9</p>
                  {!user?.weight && (
                    <p className="text-xs text-slate-600 mt-2">Add weight & height in Profile</p>
                  )}
                </div>
              </motion.div>

              {/* Goal Completion */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="glass rounded-2xl p-5 flex flex-col items-center gap-4"
              >
                <h3 className="font-bold text-white self-start">Goal Completion</h3>
                <ProgressRing
                  progress={goalCompletion}
                  size={120}
                  strokeWidth={9}
                  color="#7c3aed"
                  label={`${goalCompletion}%`}
                  sublabel="of 30 workouts"
                />
                <div className="text-center">
                  <p className="text-sm text-slate-300 font-medium">{analytics.total} / 30 this month</p>
                  <p className="text-xs text-violet-400 mt-1">{Math.max(0, 30 - analytics.total)} more to goal!</p>
                </div>
              </motion.div>

              {/* Personal Records */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-5"
              >
                <h3 className="font-bold text-white mb-4">Personal Records</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🏋️', label: 'Highest Reps', value: analytics.maxReps || '—' },
                    { icon: '📊', label: 'Total Workouts', value: analytics.total },
                    { icon: '⏱️', label: 'Hours Trained', value: `${analytics.totalHours}h` },
                    {
                      icon: '🔥', label: 'Weekly Average', value: analytics.weeklyData.reduce((a, b) => a + b.workouts, 0) > 0
                        ? (analytics.weeklyData.reduce((a, b) => a + b.workouts, 0) / 7).toFixed(1)
                        : '0'
                    },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/04 last:border-0">
                      <div className="flex items-center gap-2">
                        <span>{r.icon}</span>
                        <span className="text-sm text-slate-400">{r.label}</span>
                      </div>
                      <span className="font-bold text-white text-sm">{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ─── Weight Progress ─── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">Weight Progress</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Estimated timeline trend</p>
                </div>
                {user?.weight && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{user.weight} kg</p>
                    <p className="text-xs text-slate-500">Current</p>
                  </div>
                )}
              </div>
              <WeightLineChart data={analytics.weightData} targetWeight={user?.weight ? user.weight - 3 : null} />
            </motion.div>

            {/* ─── Workout Heatmap ─── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="glass rounded-2xl p-5"
            >
              <div className="mb-4">
                <h3 className="font-bold text-white">Activity Heatmap</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your workout activity over the last 16 weeks</p>
              </div>
              <WorkoutHeatmap workouts={workouts} />
            </motion.div>

            {/* ─── Achievements ─── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-5">
                <Award className="text-yellow-400" size={18} />
                <h3 className="font-bold text-white">Achievement Badges</h3>
                <span className="ml-auto text-xs text-slate-500">
                  {achievements.filter((a) => a.earned).length}/{achievements.length} earned
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {achievements.map((badge, i) => (
                  <Badge key={i} delay={i * 0.07} {...badge} />
                ))}
              </div>
            </motion.div>

          </div>
        </main>

        <MobileNav />
      </div>
    </PageTransition>
  );
}
