/**
 * Landing.jsx — Clean, simple premium landing page
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Brain, BarChart3, Dumbbell, ArrowRight, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/layout/PageTransition';

export default function Landing() {
  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: '#050508' }}>
        <Navbar />

        {/* ─── HERO ─── */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '160px 24px 120px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background blobs */}
          <div
            style={{
              position: 'absolute', top: '-80px', left: '-100px',
              width: '500px', height: '500px',
              background: '#5b21b6', borderRadius: '50%',
              opacity: 0.08, filter: 'blur(100px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: '-60px', right: '-80px',
              width: '400px', height: '400px',
              background: '#0e7490', borderRadius: '50%',
              opacity: 0.08, filter: 'blur(100px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', width: '100%' }}>
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                marginBottom: '28px',
                padding: '6px 16px',
                borderRadius: '999px',
                border: '1px solid rgba(124,58,237,0.4)',
                background: 'rgba(124,58,237,0.1)',
                color: '#c4b5fd',
                fontSize: '13px', fontWeight: 500,
              }}
            >
              <Zap size={13} fill="currentColor" />
              AI-Powered Fitness Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                color: '#f8fafc',
                lineHeight: 1.1,
                marginBottom: '24px',
                letterSpacing: '-0.02em',
              }}
            >
              Train Smarter.{' '}
              <span className="gradient-text">Get Stronger.</span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              style={{
                fontSize: '18px',
                color: '#94a3b8',
                maxWidth: '520px',
                margin: '0 auto 40px',
                lineHeight: 1.65,
              }}
            >
              Your AI fitness coach that tracks workouts, analyzes your progress,
              and delivers personalized plans — all in one beautiful app.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    background: '#7c3aed',
                    color: '#fff',
                    fontSize: '15px', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#6d28d9'}
                  onMouseOut={e => e.currentTarget.style.background = '#7c3aed'}
                >
                  Get Started Free <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#cbd5e1',
                    fontSize: '15px', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '20px', marginTop: '48px', flexWrap: 'wrap',
                fontSize: '14px', color: '#64748b',
              }}
            >
              <div style={{ display: 'flex' }}>
                {['SC', 'MJ', 'PS', 'AR', 'KL'].map((av, i) => (
                  <div
                    key={i}
                    style={{
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      border: '2px solid #050508',
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, color: '#fff',
                      marginLeft: i === 0 ? '0' : '-8px',
                    }}
                  >
                    {av}
                  </div>
                ))}
              </div>
              <span>
                Trusted by <strong style={{ color: '#cbd5e1' }}>50,000+ athletes</strong>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                <span style={{ color: '#64748b', marginLeft: '4px', fontSize: '12px' }}>4.9 / 5</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" style={{ padding: '120px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <p style={{
              color: '#a78bfa', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px',
            }}>
              Features
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#f8fafc', lineHeight: 1.15 }}>
              Everything you need to{' '}
              <span className="gradient-text">dominate</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              {
                icon: Brain,
                iconBg: 'rgba(124,58,237,0.15)', iconColor: '#a78bfa', iconBorder: 'rgba(124,58,237,0.3)',
                title: 'AI Fitness Coach',
                desc: 'Get instant, personalized workout and diet advice powered by advanced AI — available 24/7.',
              },
              {
                icon: BarChart3,
                iconBg: 'rgba(6,182,212,0.15)', iconColor: '#22d3ee', iconBorder: 'rgba(6,182,212,0.3)',
                title: 'Smart Analytics',
                desc: 'Beautiful charts that reveal your weekly progress, calorie burn, and muscle group balance.',
              },
              {
                icon: Dumbbell,
                iconBg: 'rgba(96,165,250,0.15)', iconColor: '#60a5fa', iconBorder: 'rgba(96,165,250,0.3)',
                title: 'Workout Tracking',
                desc: 'Log sets, reps, and exercises effortlessly. Build streaks and unlock achievement badges.',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex', flexDirection: 'column', gap: '16px',
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: f.iconBg, border: `1px solid ${f.iconBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.iconColor,
                }}>
                  <f.icon size={22} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section style={{ padding: '80px 24px 120px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              maxWidth: '700px', margin: '0 auto', textAlign: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: '24px',
              padding: '64px 32px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#f8fafc', marginBottom: '16px' }}>
                Ready to <span className="gradient-text">transform</span>?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '17px', marginBottom: '36px' }}>
                Join thousands of athletes crushing their goals with FitAI.
              </p>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px', borderRadius: '12px',
                    background: '#7c3aed', color: '#fff',
                    fontSize: '15px', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#6d28d9'}
                  onMouseOut={e => e.currentTarget.style.background = '#7c3aed'}
                >
                  Start Free Today <Zap size={16} fill="currentColor" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '28px 24px',
        }}>
          <div style={{
            maxWidth: '1080px', margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={13} color="#fff" fill="#fff" />
              </div>
              <span className="gradient-text" style={{ fontWeight: 800, fontSize: '16px' }}>FitAI</span>
            </div>
            <p style={{ color: '#475569', fontSize: '13px' }}>© 2025 FitAI. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Privacy', 'Terms'].map(l => (
                <a key={l} href="#" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}
                  onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseOut={e => e.currentTarget.style.color = '#475569'}
                >{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
