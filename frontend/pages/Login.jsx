/**
 * Login.jsx — Clean centered login with visible glass card
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import PageTransition from '../components/layout/PageTransition';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data);
      await loginUser(res.data.token);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh',
        background: '#050508',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: '#5b21b6', borderRadius: '50%',
          opacity: 0.08, filter: 'blur(120px)', pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: '#7c3aed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 30px rgba(124,58,237,0.5)',
            }}>
              <Zap size={22} color="#fff" fill="#fff" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#f8fafc', marginBottom: '6px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '32px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={16} />}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                  })}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  icon={<Lock size={16} />}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                />
              </div>

              {/* Remember + Forgot */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '24px',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
                  <input type="checkbox" style={{ accentColor: '#7c3aed', width: '14px', height: '14px' }} {...register('remember')} />
                  Remember me
                </label>
                <a href="#" style={{ color: '#a78bfa', fontSize: '13px', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: '12px',
                  background: loading ? '#5b21b6' : '#7c3aed',
                  color: '#fff', fontSize: '15px', fontWeight: 600,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
                  transition: 'background 0.2s',
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      display: 'inline-block',
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '12px', color: '#475569' }}>demo access</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Demo credentials */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Try demo account</p>
              <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8' }}>
                demo@fitai.app · demo123
              </p>
            </div>
          </motion.div>

          {/* Back */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: 'center', marginTop: '24px' }}
          >
            <Link to="/" style={{ fontSize: '13px', color: '#475569', textDecoration: 'none' }}
              onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseOut={e => e.currentTarget.style.color = '#475569'}
            >
              ← Back to home
            </Link>
          </motion.div>
        </div>

        {/* Spin keyframe */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </PageTransition>
  );
}
