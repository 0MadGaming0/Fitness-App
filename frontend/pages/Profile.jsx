/**
 * Profile.jsx — Editable user profile with BMI calculator and save animation
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Scale, Ruler, Calendar, Target, Check, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ProgressRing from '../components/ui/ProgressRing';

const GOAL_OPTIONS = [
  { value: 'weight_loss',    label: '🔥 Weight Loss' },
  { value: 'muscle_gain',    label: '💪 Muscle Gain' },
  { value: 'endurance',      label: '🏃 Endurance' },
  { value: 'flexibility',    label: '🧘 Flexibility' },
  { value: 'general_fitness',label: '⚡ General Fitness' },
  { value: 'strength',       label: '🏋️ Strength' },
];

function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = parseFloat(height) / 100;
  const bmi = parseFloat(weight) / (h * h);
  return Math.round(bmi * 10) / 10;
}

function getBMIInfo(bmi) {
  if (!bmi) return { label: '—', color: 'text-slate-400', progress: 0, barColor: '#64748b' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', progress: 30, barColor: '#60a5fa' };
  if (bmi < 25)   return { label: 'Normal',      color: 'text-green-400', progress: 60, barColor: '#34d399' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'text-yellow-400',progress: 80, barColor: '#fbbf24' };
  return           { label: 'Obese',       color: 'text-red-400',   progress: 95, barColor: '#f87171' };
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { saveProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      reset({
        name:   user.name || '',
        age:    user.age || '',
        weight: user.weight || '',
        height: user.height || '',
        goal:   user.goal || '',
      });
    }
  }, [user, reset]);

  const watchWeight = watch('weight');
  const watchHeight = watch('height');
  const bmi = calcBMI(watchWeight, watchHeight);
  const bmiInfo = getBMIInfo(bmi);

  const onSubmit = async (data) => {
    setLoading(true);
    const ok = await saveProfile({
      name:   data.name,
      age:    parseInt(data.age) || null,
      weight: parseFloat(data.weight) || null,
      height: parseFloat(data.height) || null,
      goal:   data.goal,
    });
    setLoading(false);
    if (ok) {
      await refreshUser();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-[#050508]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '36px' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <User className="text-violet-400" size={22} />
                Profile
              </h1>
              <p className="text-slate-500 text-sm mt-1">Manage your personal details</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* ─── Avatar + BMI Panel ─── */}
              <div className="space-y-5">
                {/* Avatar card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl p-6 flex flex-col items-center text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mb-4 cursor-pointer shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                  >
                    <span className="text-3xl font-black text-white">{initials}</span>
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-violet-600 border-2 border-[#050508] flex items-center justify-center">
                      <Edit2 size={11} className="text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-lg font-bold text-white">{user?.name || 'Athlete'}</h2>
                  <p className="text-sm text-slate-500 mt-0.5" style={{ wordBreak: 'break-all', width: '100%', padding: '0 8px' }}>{user?.email}</p>
                  {user?.goal && (
                    <span className="mt-3 text-xs px-3 py-1.5 rounded-full bg-violet-600/15 text-violet-400 border border-violet-500/20">
                      {GOAL_OPTIONS.find((g) => g.value === user.goal)?.label || user.goal}
                    </span>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 w-full mt-5 pt-5 border-t border-white/06">
                    {[
                      { label: 'Age',    value: user?.age ? `${user.age}y` : '—' },
                      { label: 'Weight', value: user?.weight ? `${user.weight}kg` : '—' },
                      { label: 'Height', value: user?.height ? `${user.height}cm` : '—' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="font-bold text-white text-sm">{s.value}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* BMI Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl p-5 flex flex-col items-center gap-4"
                >
                  <h3 className="font-bold text-white self-start text-sm">BMI Score</h3>
                  <ProgressRing
                    progress={bmiInfo.progress}
                    size={110}
                    strokeWidth={9}
                    color={bmiInfo.barColor}
                    label={bmi ? bmi.toString() : '—'}
                    sublabel="BMI"
                  />
                  <div className="text-center w-full">
                    <p className={`font-semibold text-sm ${bmiInfo.color}`}>{bmiInfo.label}</p>
                    <p className="text-xs text-slate-600 mt-1">Healthy: 18.5 – 24.9</p>
                  </div>
                </motion.div>
              </div>

              {/* ─── Edit Form ─── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="md:col-span-2 glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white">Personal Details</h3>
                  <div className="flex items-center gap-2">
                    {/* Saved indicator */}
                    <AnimatePresence>
                      {saved && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1.5 text-green-400 text-xs font-medium"
                        >
                          <Check size={14} /> Saved!
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!editing ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit2 size={14} />}
                        onClick={() => setEditing(true)}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditing(false); reset(); }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      icon={<User size={14} />}
                      disabled={!editing}
                      error={errors.name?.message}
                      {...register('name', { required: 'Name is required' })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/06 text-slate-500 text-sm">
                        <Mail size={14} />
                        <span className="truncate">{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input
                      label="Age"
                      type="number"
                      placeholder="25"
                      icon={<Calendar size={14} />}
                      disabled={!editing}
                      error={errors.age?.message}
                      {...register('age', {
                        min: { value: 10, message: 'Min 10' },
                        max: { value: 120, message: 'Max 120' },
                      })}
                    />
                    <Input
                      label="Weight (kg)"
                      type="number"
                      placeholder="70"
                      icon={<Scale size={14} />}
                      disabled={!editing}
                      step="0.1"
                      {...register('weight', {
                        min: { value: 30, message: 'Min 30' },
                        max: { value: 300, message: 'Max 300' },
                      })}
                    />
                    <Input
                      label="Height (cm)"
                      type="number"
                      placeholder="175"
                      icon={<Ruler size={14} />}
                      disabled={!editing}
                      {...register('height', {
                        min: { value: 50, message: 'Min 50' },
                        max: { value: 300, message: 'Max 300' },
                      })}
                    />
                  </div>

                  {/* Fitness Goal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fitness Goal
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {GOAL_OPTIONS.map((g) => {
                        const isSelected = watch('goal') === g.value;
                        return (
                          <label
                            key={g.value}
                            className={`
                              flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm
                              cursor-pointer transition-all duration-200
                              ${editing ? 'cursor-pointer hover:border-violet-500/50' : 'cursor-default'}
                              ${isSelected
                                ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                : 'glass border-white/08 text-slate-400'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              value={g.value}
                              disabled={!editing}
                              className="sr-only"
                              {...register('goal')}
                            />
                            {g.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end pt-2"
                    >
                      <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        icon={<Save size={15} />}
                      >
                        Save Changes
                      </Button>
                    </motion.div>
                  )}
                </form>
              </motion.div>
            </div>

          </div>
        </main>

        <MobileNav />
      </div>
    </PageTransition>
  );
}
