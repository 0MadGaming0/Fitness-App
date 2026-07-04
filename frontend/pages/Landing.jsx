/**
 * Landing.jsx — Clean, simple premium landing page
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Brain, BarChart3, Dumbbell, ArrowRight, Star, Heart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/layout/PageTransition';
import api from '../services/api';

const LANDING_QUOTES = [
  { text: "No alarm clock needed. My passion wakes me up.", author: "Eric Thomas" },
  { text: "Your health is an investment, not an expense.", author: "Unknown" },
  { text: "Today is your chance to build the tomorrow you want.", author: "Kenji Miyazawa" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred Devito" },
  { text: "The difference between try and triumph is just a little umph.", author: "Marvin Phillips" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" }
];

export default function Landing() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const dailyQuote = LANDING_QUOTES[dayOfYear % LANDING_QUOTES.length];

  const [featuredFeedbacks, setFeaturedFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/feedback/featured');
        setFeaturedFeedbacks(res.data);
      } catch (err) {
        console.error("Failed to load featured reviews:", err);
      }
    };
    fetchFeatured();
  }, []);

  const avgRating = featuredFeedbacks.length > 0
    ? (featuredFeedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / featuredFeedbacks.length).toFixed(1)
    : '4.9';

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
                margin: '0 auto 20px',
                lineHeight: 1.65,
              }}
            >
              Your AI fitness coach that tracks workouts, analyzes your progress,
              and delivers personalized plans — all in one beautiful app.
            </motion.p>

            {/* Rating Stars Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '36px',
              }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                ))}
              </div>
              <span style={{ fontSize: '13.5px', color: '#94a3b8', fontWeight: 700 }}>
                {avgRating}/5 rating from user reviews
              </span>
            </motion.div>

            {/* Bold Neon Daily Quote */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              style={{
                maxWidth: '600px',
                margin: '0 auto 36px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))',
                borderRadius: '24px',
                border: '1px solid rgba(124,58,237,0.25)',
                boxShadow: '0 0 35px rgba(124,58,237,0.15)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                  background: 'linear-gradient(to right, #a78bfa, #f472b6, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.5))',
                  marginBottom: '10px',
                }}
              >
                "{dailyQuote.text}"
              </p>
              <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.08em' }}>
                — {dailyQuote.author}
              </p>
            </motion.div>

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

        {/* ─── TESTIMONIALS / USER REVIEWS ─── */}
        {featuredFeedbacks.length > 0 && (
          <section
            style={{
              maxWidth: '1080px',
              margin: '0 auto',
              padding: '80px 24px 40px',
              position: 'relative',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', tracking: '0.1em', marginBottom: '8px' }}>
                <Star size={12} fill="currentColor" />
                Community Wall
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                User Reviews & <span className="gradient-text">Ratings</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '10px' }}>
                Real feedback from athletes tracking consistency and building healthy habits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredFeedbacks.map((fb, idx) => (
                <motion.div
                  key={fb._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div className="absolute w-24 h-24 bg-violet-600/05 rounded-full blur-2xl top-0 right-0 pointer-events-none" />
                  
                  <div>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={14}
                          style={{ color: starIdx < (fb.rating || 5) ? '#fbbf24' : '#334155', fill: starIdx < (fb.rating || 5) ? '#fbbf24' : 'transparent' }}
                        />
                      ))}
                    </div>

                    <p style={{ fontSize: '13.5px', color: '#e2e8f0', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                      "{fb.comment}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '11px', fontWeight: 800,
                    }}>
                      {fb.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                        {fb.name}
                      </p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0' }}>
                        {fb.type}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

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
