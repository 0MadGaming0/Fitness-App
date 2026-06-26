/**
 * Button.jsx — Reusable animated button with variants
 * Variants: primary | secondary | ghost | danger
 */
import { motion } from 'framer-motion';
import Spinner from './Spinner';

const variants = {
  primary: `
    bg-violet-600 hover:bg-violet-500
    text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)]
    hover:shadow-[0_6px_20px_rgba(124,58,237,0.6)]
  `,
  secondary: `
    bg-white/5 hover:bg-white/10
    text-slate-200 border border-white/10
    hover:border-violet-500/50
  `,
  ghost: `
    bg-transparent hover:bg-white/5
    text-slate-300 hover:text-white
  `,
  danger: `
    bg-red-600/20 hover:bg-red-600/30
    text-red-400 border border-red-500/20
    hover:border-red-500/50
  `,
  cyan: `
    bg-cyan-500 hover:bg-cyan-400
    text-white shadow-[0_4px_14px_rgba(6,182,212,0.4)]
    hover:shadow-[0_6px_20px_rgba(6,182,212,0.6)]
  `,
};

const sizeStyles = {
  sm:  { padding: '8px 14px', fontSize: '13px' },
  md:  { padding: '11px 22px', fontSize: '14px' },
  lg:  { padding: '13px 28px', fontSize: '16px' },
  xl:  { padding: '17px 34px', fontSize: '18px' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  fullWidth = false,
  onClick,
  type = 'button',
  style,
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-semibold rounded-xl cursor-pointer
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ ...sizeStyles[size], ...style }}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="border-current/20 border-t-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0" style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
