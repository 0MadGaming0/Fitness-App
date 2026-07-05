import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Scale, Ruler, Calendar, Target,
  Check, Edit2, Save, Camera, Upload, X, Image, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { uploadAvatar } from '../services/profileService';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ProgressRing from '../components/ui/ProgressRing';
import { AvatarDisplay, PRESET_AVATARS, getPreset } from '../components/ui/AvatarDisplay';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GOAL_OPTIONS = [
  { value: 'weight_loss',     label: '🔥 Weight Loss' },
  { value: 'muscle_gain',     label: '💪 Muscle Gain' },
  { value: 'endurance',       label: '🏃 Endurance' },
  { value: 'flexibility',     label: '🧘 Flexibility' },
  { value: 'general_fitness', label: '⚡ General Fitness' },
  { value: 'strength',        label: '🏋️ Strength' },
];

function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = parseFloat(height) / 100;
  return Math.round((parseFloat(weight) / (h * h)) * 10) / 10;
}

function getBMIInfo(bmi) {
  if (!bmi) return { label: '—', color: 'text-slate-400', progress: 0, barColor: '#64748b' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400',   progress: 30, barColor: '#60a5fa' };
  if (bmi < 25)   return { label: 'Normal',      color: 'text-green-400',  progress: 60, barColor: '#34d399' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'text-yellow-400', progress: 80, barColor: '#fbbf24' };
  return                  { label: 'Obese',       color: 'text-red-400',    progress: 95, barColor: '#f87171' };
}

/** Compress an image file to a base64 data URL (max 300×300, q=0.82) */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 300;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else                { width  = Math.round((width  * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}



// ─── Avatar Modal ─────────────────────────────────────────────────────────────
function AvatarModal({ currentAvatar, initials, onSave, onClose }) {
  const [tab, setTab] = useState('presets'); // 'presets' | 'upload'
  const [selected, setSelected] = useState(currentAvatar || null);
  const [preview, setPreview]   = useState(null); // compressed base64
  const [saving, setSaving]     = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error('File must be under 8 MB'); return; }
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      setSelected(compressed);
    } catch {
      toast.error('Failed to process image');
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await onSave(selected);
    setSaving(false);
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 600,
    borderRadius: '10px', border: 'none', cursor: 'pointer',
    transition: 'all 0.2s',
    background: active ? 'rgba(124,58,237,0.25)' : 'transparent',
    color: active ? '#a78bfa' : '#64748b',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px',
          background: 'linear-gradient(145deg,rgba(20,20,35,0.98),rgba(12,12,22,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '28px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', margin: 0 }}>
            Change Profile Picture
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <AvatarDisplay avatar={selected} initials={initials} size={88} shadow={false} />
            {selected && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#22c55e', border: '2px solid #0c0c16',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Check size={11} color="#fff" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '4px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
          marginBottom: '20px',
        }}>
          <button style={tabStyle(tab === 'presets')} onClick={() => setTab('presets')}>
            🎨 Choose Avatar
          </button>
          <button style={tabStyle(tab === 'upload')} onClick={() => setTab('upload')}>
            📷 Upload Photo
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'presets' ? (
            <motion.div
              key="presets"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
            >
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
                marginBottom: '20px',
              }}>
                {PRESET_AVATARS.map((av) => {
                  const isActive = selected === av.id;
                  return (
                    <motion.button
                      key={av.id}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelected(av.id); setPreview(null); }}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: '16px',
                        background: av.gradient,
                        border: isActive ? '2px solid #a78bfa' : '2px solid transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '28px',
                        boxShadow: isActive ? '0 0 16px rgba(124,58,237,0.5)' : 'none',
                        transition: 'box-shadow 0.2s, border 0.2s',
                        position: 'relative',
                      }}
                    >
                      {av.emoji}
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: '#a78bfa', border: '2px solid #0c0c16',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={10} color="#fff" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}
              style={{ marginBottom: '20px' }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: '2px dashed rgba(124,58,237,0.4)',
                  borderRadius: '16px', padding: '32px',
                  textAlign: 'center', cursor: 'pointer',
                  background: 'rgba(124,58,237,0.05)',
                  transition: 'all 0.2s',
                }}
              >
                {preview ? (
                  <div>
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        objectFit: 'cover', margin: '0 auto 12px', display: 'block',
                        border: '2px solid rgba(124,58,237,0.5)',
                      }}
                    />
                    <p style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 600 }}>
                      Image ready — click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '14px',
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}>
                      <Upload size={22} color="#a78bfa" />
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>
                      Click to upload a photo
                    </p>
                    <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>
                      JPG, PNG, WebP — max 8 MB
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save / Cancel */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748b', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: selected && !saving ? 1.02 : 1 }}
            whileTap={{ scale: selected && !saving ? 0.97 : 1 }}
            disabled={!selected || saving}
            onClick={handleSave}
            style={{
              flex: 2, padding: '11px', borderRadius: '12px',
              background: selected
                ? 'linear-gradient(135deg,#7c3aed,#6d28d9)'
                : 'rgba(255,255,255,0.04)',
              border: 'none', color: selected ? '#fff' : '#475569',
              fontWeight: 700, fontSize: '14px', cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            {saving ? (
              <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <Check size={15} />
            )}
            {saving ? 'Saving…' : 'Save Avatar'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, refreshUser, logoutUser } = useAuth();
  const { saveProfile } = useProfile();
  const navigate = useNavigate();

  const [editing, setEditing]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [loading, setLoading]         = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const formInitialized = useRef(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  // Seed the form only on first load — NOT on every refreshUser() call
  // (avatar saves call refreshUser() which would otherwise wipe unsaved field values)
  useEffect(() => {
    if (user && !formInitialized.current) {
      formInitialized.current = true;
      reset({
        name:   user.name   || '',
        age:    user.age    || '',
        weight: user.weight || '',
        height: user.height || '',
        goal:   user.goal   || '',
      });
    }
  }, [user, reset]);

  const watchWeight = watch('weight');
  const watchHeight = watch('height');
  const bmi     = calcBMI(watchWeight, watchHeight);
  const bmiInfo = getBMIInfo(bmi);

  const onSubmit = async (data) => {
    setLoading(true);
    const ok = await saveProfile({
      name:   data.name,
      age:    parseInt(data.age)     || null,
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

  const handleAvatarSave = async (avatarData) => {
    try {
      await uploadAvatar(avatarData);
      await refreshUser();
      setShowAvatarModal(false);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to save avatar');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-[var(--bg-app)]">
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
                  {/* Clickable avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative mb-4 cursor-pointer"
                    onClick={() => setShowAvatarModal(true)}
                    title="Change profile picture"
                  >
                    <AvatarDisplay avatar={user?.avatar} initials={initials} size={96} />

                    {/* Camera overlay on hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Camera size={22} color="#fff" />
                    </motion.div>

                    {/* Edit badge */}
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

                  {/* Change photo button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAvatarModal(true)}
                    style={{
                      marginTop: '14px', width: '100%', padding: '9px 0',
                      borderRadius: '12px', border: '1px solid rgba(124,58,237,0.3)',
                      background: 'rgba(124,58,237,0.08)', color: '#a78bfa',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Image size={13} />
                    Change Photo
                  </motion.button>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 w-full mt-5 pt-5 border-t border-white/06">
                    {[
                      { label: 'Age',    value: user?.age    ? `${user.age}y`    : '—' },
                      { label: 'Weight', value: user?.weight ? `${user.weight}kg`: '—' },
                      { label: 'Height', value: user?.height ? `${user.height}cm`: '—' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="font-bold text-white text-sm">{s.value}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Mobile-only quick actions: Settings + Logout ── */}
                  <div className="md:hidden w-full mt-4 pt-4 border-t border-white/06 flex flex-col gap-2">
                    {/* Settings */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/settings')}
                      style={{
                        width: '100%', padding: '10px 0',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#94a3b8',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Settings size={14} />
                      Settings
                    </motion.button>

                    {/* Logout */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        logoutUser();
                        navigate('/login');
                      }}
                      style={{
                        width: '100%', padding: '10px 0',
                        borderRadius: '12px',
                        border: '1px solid rgba(239,68,68,0.25)',
                        background: 'rgba(239,68,68,0.07)',
                        color: '#f87171',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <LogOut size={14} />
                      Logout
                    </motion.button>
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

                {/* Admin Console Card (Owner Only) */}
                {user?.email === 'owner@fitai.com' && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass rounded-2xl p-5 border border-violet-500/20 bg-violet-600/[0.03] flex flex-col gap-3 text-center items-center relative overflow-hidden"
                  >
                    <div className="absolute w-24 h-24 bg-violet-600/10 rounded-full blur-2xl -top-5 -right-5 pointer-events-none" />
                    <h3 className="font-extrabold text-violet-400 text-xs uppercase tracking-wider">Owner Console</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Review feedbacks and ratings submitted by users of the FitAI platform.
                    </p>
                    <button
                      onClick={() => navigate('/admin/feedback')}
                      className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-violet-600/20 border border-violet-500/20"
                    >
                      View User Feedbacks
                    </button>
                  </motion.div>
                )}
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
                        min: { value: 10,  message: 'Min 10'  },
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
                        min: { value: 30,  message: 'Min 30'  },
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
                        min: { value: 50,  message: 'Min 50'  },
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
                              transition-all duration-200
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

      {/* Avatar modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <AvatarModal
            currentAvatar={user?.avatar}
            initials={initials}
            onSave={handleAvatarSave}
            onClose={() => setShowAvatarModal(false)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
