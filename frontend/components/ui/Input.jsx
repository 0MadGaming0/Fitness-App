/**
 * Input.jsx — Animated form input with label, icon, error, password toggle
 */
import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(function Input(
  { label, error, icon, type = 'text', placeholder, className = '', hint, required, disabled, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const borderColor = error
    ? 'rgba(239,68,68,0.6)'
    : focused
    ? 'rgba(124,58,237,0.7)'
    : 'var(--input-border)';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          {label}
          {required && <span style={{ color: '#a78bfa' }} className="ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ left: '14px', color: focused ? '#a78bfa' : '#64748b', transition: 'color 0.2s' }}
          >
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: icon ? '44px' : '16px',
            paddingRight: isPassword ? '48px' : '16px',
            borderRadius: '12px',
            fontSize: '14px',
            color: 'var(--input-text)',
            background: 'var(--input-bg)',
            border: `1px solid ${borderColor}`,
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseOut={e => e.currentTarget.style.color = '#64748b'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs" style={{ color: '#64748b' }}>{hint}</p>
      )}
    </div>
  );
});

export default Input;
