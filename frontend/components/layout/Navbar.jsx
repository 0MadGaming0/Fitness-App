/**
 * Navbar.jsx — Fixed top navigation for Landing page
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'all 0.3s ease',
    padding: scrolled ? '12px 0' : '20px 0',
    background: scrolled ? 'rgba(5,5,8,0.85)' : 'transparent',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
  };

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={navStyle}
    >
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          <span className="gradient-text" style={{ fontSize: '18px', fontWeight: 900 }}>FitAI</span>
        </Link>

        {/* Center: Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', gap: '28px' }}>
          <a href="#features" style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}
            onMouseOver={e => e.currentTarget.style.color = '#f8fafc'}
            onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
          >
            Features
          </a>
        </div>

        {/* Right: Auth Action & Mobile hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="hide-mobile" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '8px 18px', borderRadius: '10px',
                background: 'transparent', border: 'none',
                color: '#94a3b8', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', transition: 'color 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
              >
                Login
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '9px 20px', borderRadius: '10px',
                  background: '#7c3aed', color: '#fff',
                  fontSize: '14px', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#6d28d9'}
                onMouseOut={e => e.currentTarget.style.background = '#7c3aed'}
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          <button
            className="show-mobile"
            onClick={() => setMobileOpen(v => !v)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(5,5,8,0.95)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#features" onClick={() => setMobileOpen(false)}
                style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none', padding: '4px 0' }}>
                Features
              </a>
              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                <Link to="/login" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                  <button style={{
                    width: '100%', padding: '11px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: '#cbd5e1',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  }}>Login</button>
                </Link>
                <Link to="/register" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                  <button style={{
                    width: '100%', padding: '11px', borderRadius: '10px',
                    background: '#7c3aed', color: '#fff',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none',
                  }}>Get Started</button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </motion.nav>
  );
}
