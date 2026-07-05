/**
 * Settings.jsx — App settings: theme, notifications, account, privacy.
 * All toggles are persisted to the backend via PUT /profile { settings: {...} }.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Moon, Sun, Bell, Shield, LogOut,
  ChevronRight, Check, Trash2, Lock, Save, Link2, Copy
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/profileService';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { changePassword } from '../services/authService';
import toast from 'react-hot-toast';

// ─── Default settings (used when user has none saved) ───────────────────────
const DEFAULT_NOTIFICATIONS = {
  push: true,
  email: false,
  workoutReminder: true,
  achievements: true,
};

const DEFAULT_PRIVACY = {
  publicProfile: false,
  shareWorkouts: false,
  analyticsOpt: true,
};

// ─── Toggle component ────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer
        ${checked ? 'bg-violet-600' : 'bg-white/10'}
      `}
      aria-checked={checked}
      role="switch"
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

// ─── Setting row ─────────────────────────────────────────────────────────────
function SettingRow({ icon: Icon, title, desc, children, iconColor = 'violet' }) {
  const colorMap = {
    violet: 'bg-violet-600/15 text-violet-400',
    cyan:   'bg-cyan-600/15 text-cyan-400',
    red:    'bg-red-600/15 text-red-400',
    blue:   'bg-blue-600/15 text-blue-400',
    orange: 'bg-orange-600/15 text-orange-400',
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/05 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[iconColor]}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Setting section card ─────────────────────────────────────────────────────
function SettingSection({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user, refreshUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  // ── Password modal state ──
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwLoading, setPwLoading] = useState(false);

  // ── Settings state — seeded from user.settings once user loads ──
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [privacy, setPrivacy]             = useState(DEFAULT_PRIVACY);
  const [saving, setSaving]               = useState(false);
  const initialized = useRef(false);

  // Seed from backend on first user load
  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true;
      const saved = user.settings || {};
      setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(saved.notifications || {}) });
      setPrivacy({ ...DEFAULT_PRIVACY, ...(saved.privacy || {}) });
    }
  }, [user]);

  // ── Persist settings to backend ──
  const saveSettingsRef = useRef(null);

  const persistSettings = useCallback(async (notifs, priv) => {
    setSaving(true);
    try {
      await updateProfile({
        settings: {
          notifications: notifs,
          privacy: priv,
        },
      });
      await refreshUser();
      toast.success('Settings saved!', { id: 'settings-save', duration: 1500 });
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [refreshUser]);

  // Debounced save — fires 800ms after last toggle change
  const debouncedSave = useCallback((notifs, priv) => {
    if (saveSettingsRef.current) clearTimeout(saveSettingsRef.current);
    saveSettingsRef.current = setTimeout(() => {
      persistSettings(notifs, priv);
    }, 800);
  }, [persistSettings]);

  const handleNotifChange = (key, value) => {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    debouncedSave(next, privacy);
  };

  const handlePrivacyChange = (key, value) => {
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    debouncedSave(notifications, next);
  };

  // ── Change Password ──
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setPwLoading(true);
    try {
      const response = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success(response.data?.message || 'Password updated successfully!');
      setIsPasswordModalOpen(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Logout / Delete ──
  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is disabled in demo mode');
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-[var(--bg-app)]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <SettingsIcon className="text-violet-400" size={22} />
                    Settings
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">Customize your FitAI experience</p>
                </div>
                {saving && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-violet-400 text-xs font-semibold"
                  >
                    <Save size={13} className="animate-pulse" />
                    Saving…
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* ── Appearance ── */}
            <SettingSection title="Appearance" delay={0.05}>
              <SettingRow
                icon={isDark ? Moon : Sun}
                title="Dark Mode"
                desc="Switch between dark and light theme"
                iconColor="violet"
              >
                <Toggle checked={isDark} onChange={toggleTheme} />
              </SettingRow>
            </SettingSection>

            {/* ── Notifications ── */}
            <SettingSection title="Notifications" delay={0.1}>
              <SettingRow
                icon={Bell}
                title="Push Notifications"
                desc="Receive workout reminders"
                iconColor="cyan"
              >
                <Toggle
                  checked={notifications.push}
                  onChange={(v) => handleNotifChange('push', v)}
                />
              </SettingRow>
              <SettingRow
                icon={Bell}
                title="Email Updates"
                desc="Weekly progress reports via email"
                iconColor="cyan"
              >
                <Toggle
                  checked={notifications.email}
                  onChange={(v) => handleNotifChange('email', v)}
                />
              </SettingRow>
              <SettingRow
                icon={Bell}
                title="Workout Reminders"
                desc="Daily workout time reminders"
                iconColor="cyan"
              >
                <Toggle
                  checked={notifications.workoutReminder}
                  onChange={(v) => handleNotifChange('workoutReminder', v)}
                />
              </SettingRow>
              <SettingRow
                icon={Bell}
                title="Achievement Alerts"
                desc="Get notified when you earn badges"
                iconColor="cyan"
              >
                <Toggle
                  checked={notifications.achievements}
                  onChange={(v) => handleNotifChange('achievements', v)}
                />
              </SettingRow>
            </SettingSection>

            {/* ── Privacy ── */}
            <SettingSection title="Privacy" delay={0.15}>
              <SettingRow
                icon={Shield}
                title="Public Profile"
                desc="Let others discover your profile"
                iconColor="blue"
              >
                <Toggle
                  checked={privacy.publicProfile}
                  onChange={(v) => handlePrivacyChange('publicProfile', v)}
                />
              </SettingRow>

              {/* Shareable link — shown when Public Profile is on */}
              {privacy.publicProfile && user?._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-1 mb-2 mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20"
                >
                  <Link2 size={13} className="text-violet-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400 truncate flex-1">
                    {`${window.location.origin}/public-profile/${user._id}`}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/public-profile/${user._id}`);
                      toast.success('Link copied!');
                    }}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer transition-colors flex-shrink-0"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </motion.div>
              )}

              <SettingRow
                icon={Shield}
                title="Share Workouts"
                desc={privacy.publicProfile ? 'Allow friends to see your workouts' : 'Enable Public Profile first'}
                iconColor="blue"
              >
                <Toggle
                  checked={privacy.shareWorkouts}
                  onChange={(v) => {
                    if (!privacy.publicProfile) {
                      toast.error('Enable Public Profile first to share workouts');
                      return;
                    }
                    handlePrivacyChange('shareWorkouts', v);
                  }}
                />
              </SettingRow>
              <SettingRow
                icon={Check}
                title="Analytics Opt-In"
                desc="Help improve FitAI with usage data"
                iconColor="blue"
              >
                <Toggle
                  checked={privacy.analyticsOpt}
                  onChange={(v) => handlePrivacyChange('analyticsOpt', v)}
                />
              </SettingRow>
            </SettingSection>

            {/* ── Account ── */}
            <SettingSection title="Account" delay={0.2}>
              <SettingRow
                icon={Lock}
                title="Change Password"
                desc="Update your account password"
                iconColor="orange"
              >
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </SettingRow>
              <SettingRow icon={LogOut} title="Sign Out" desc="Log out from all devices" iconColor="red">
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </SettingRow>
            </SettingSection>

            {/* ── Danger Zone ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-5 border border-red-500/15"
            >
              <h3 className="text-xs font-bold text-red-500/70 uppercase tracking-wider mb-3">Danger Zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Delete Account</p>
                  <p className="text-xs text-slate-500 mt-0.5">Permanently delete all your data</p>
                </div>
                <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={handleDeleteAccount}>
                  Delete
                </Button>
              </div>
            </motion.div>

            {/* Version */}
            <p className="text-center text-xs text-slate-700 pb-4">
              FitAI v1.0.0 · Built with ❤️
            </p>

          </div>
        </main>

        {/* Change Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }}
          title="Change Password"
        >
          <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password (min 6 chars)"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={pwLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={pwLoading}
              >
                Save Password
              </Button>
            </div>
          </form>
        </Modal>

        <MobileNav />
      </div>
    </PageTransition>
  );
}
