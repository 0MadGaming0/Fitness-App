/**
 * Settings.jsx — App settings: theme, notifications, account, privacy
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Moon, Sun, Bell, Shield, LogOut,
  ChevronRight, Check, Trash2, Lock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { changePassword } from '../services/authService';
import toast from 'react-hot-toast';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-300
        ${checked ? 'bg-violet-600' : 'bg-white/10'}
      `}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

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

function SettingSection({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
      setLoading(false);
    }
  };

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    workoutReminder: true,
    weeklyReport: true,
    achievements: true,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareWorkouts: false,
    analyticsOpt: true,
  });

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
      <div className="flex min-h-screen bg-[#050508]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <SettingsIcon className="text-violet-400" size={22} />
                Settings
              </h1>
              <p className="text-slate-500 text-sm mt-1">Customize your FitAI experience</p>
            </motion.div>

            {/* Appearance */}
            <SettingSection title="Appearance">
              <SettingRow
                icon={isDark ? Moon : Sun}
                title="Dark Mode"
                desc="Switch between dark and light theme"
                iconColor="violet"
              >
                <Toggle checked={isDark} onChange={toggleTheme} />
              </SettingRow>
            </SettingSection>

            {/* Notifications */}
            <SettingSection title="Notifications">
              <SettingRow icon={Bell} title="Push Notifications" desc="Receive workout reminders" iconColor="cyan">
                <Toggle
                  checked={notifications.push}
                  onChange={(v) => setNotifications((p) => ({ ...p, push: v }))}
                />
              </SettingRow>
              <SettingRow icon={Bell} title="Email Updates" desc="Weekly progress reports via email" iconColor="cyan">
                <Toggle
                  checked={notifications.email}
                  onChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
                />
              </SettingRow>
              <SettingRow icon={Bell} title="Workout Reminders" desc="Daily workout time reminders" iconColor="cyan">
                <Toggle
                  checked={notifications.workoutReminder}
                  onChange={(v) => setNotifications((p) => ({ ...p, workoutReminder: v }))}
                />
              </SettingRow>
              <SettingRow icon={Bell} title="Achievement Alerts" desc="Get notified when you earn badges" iconColor="cyan">
                <Toggle
                  checked={notifications.achievements}
                  onChange={(v) => setNotifications((p) => ({ ...p, achievements: v }))}
                />
              </SettingRow>
            </SettingSection>

            {/* Privacy */}
            <SettingSection title="Privacy">
              <SettingRow icon={Shield} title="Public Profile" desc="Let others discover your profile" iconColor="blue">
                <Toggle
                  checked={privacy.publicProfile}
                  onChange={(v) => setPrivacy((p) => ({ ...p, publicProfile: v }))}
                />
              </SettingRow>
              <SettingRow icon={Shield} title="Share Workouts" desc="Allow friends to see your workouts" iconColor="blue">
                <Toggle
                  checked={privacy.shareWorkouts}
                  onChange={(v) => setPrivacy((p) => ({ ...p, shareWorkouts: v }))}
                />
              </SettingRow>
              <SettingRow icon={Check} title="Analytics Opt-In" desc="Help improve FitAI with usage data" iconColor="blue">
                <Toggle
                  checked={privacy.analyticsOpt}
                  onChange={(v) => setPrivacy((p) => ({ ...p, analyticsOpt: v }))}
                />
              </SettingRow>
            </SettingSection>

            {/* Account */}
            <SettingSection title="Account">
              <SettingRow icon={Lock} title="Change Password" desc="Update your account password" iconColor="orange">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-slate-500 hover:text-white transition-colors"
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

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
              placeholder="Enter new password"
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
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
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
