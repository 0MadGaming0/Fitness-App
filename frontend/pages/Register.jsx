/**
 * Register.jsx — Clean centered signup, matching Login design
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { register as registerUser } from '../services/authService';
import Input from '../components/ui/Input';
import PageTransition from '../components/layout/PageTransition';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created! Please log in. 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
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
        padding: '40px 24px',
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
              Create your account
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Already have one?{' '}
              <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<User size={16} />}
                  error={errors.name?.message}
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name is too short' },
                  })}
                />

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

                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  icon={<Lock size={16} />}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                  })}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  icon={<Lock size={16} />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === password || 'Passwords do not match',
                  })}
                />

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
                    marginTop: '4px',
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
                      Creating account...
                    </>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </div>
            </form>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#475569', marginTop: '20px' }}>
              By signing up you agree to our{' '}
              <a href="#" style={{ color: '#64748b' }}>Terms</a> and{' '}
              <a href="#" style={{ color: '#64748b' }}>Privacy Policy</a>
            </p>
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

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </PageTransition>
  );
}
