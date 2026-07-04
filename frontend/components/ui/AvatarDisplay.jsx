/**
 * AvatarDisplay.jsx — Shared avatar component used in Sidebar and Profile.
 * Renders a base64 uploaded photo, a preset emoji avatar, or initials fallback.
 */

const PRESET_AVATARS = [
  { id: 'avatar:1',  emoji: '🏋️', gradient: 'linear-gradient(135deg,#7c3aed,#3b82f6)' },
  { id: 'avatar:2',  emoji: '🏃', gradient: 'linear-gradient(135deg,#06b6d4,#0d9488)' },
  { id: 'avatar:3',  emoji: '🧘', gradient: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  { id: 'avatar:4',  emoji: '🔥', gradient: 'linear-gradient(135deg,#f97316,#ef4444)' },
  { id: 'avatar:5',  emoji: '⚡', gradient: 'linear-gradient(135deg,#eab308,#f97316)' },
  { id: 'avatar:6',  emoji: '🥊', gradient: 'linear-gradient(135deg,#ef4444,#f43f5e)' },
  { id: 'avatar:7',  emoji: '🚴', gradient: 'linear-gradient(135deg,#22c55e,#10b981)' },
  { id: 'avatar:8',  emoji: '🏊', gradient: 'linear-gradient(135deg,#38bdf8,#3b82f6)' },
  { id: 'avatar:9',  emoji: '🎯', gradient: 'linear-gradient(135deg,#6366f1,#7c3aed)' },
  { id: 'avatar:10', emoji: '💪', gradient: 'linear-gradient(135deg,#64748b,#475569)' },
  { id: 'avatar:11', emoji: '🌟', gradient: 'linear-gradient(135deg,#f59e0b,#eab308)' },
  { id: 'avatar:12', emoji: '🦁', gradient: 'linear-gradient(135deg,#fb923c,#f97316)' },
];

export function getPreset(id) {
  return PRESET_AVATARS.find((a) => a.id === id) || null;
}

export { PRESET_AVATARS };

/**
 * @param {string|null} avatar  - base64 data URL or preset ID ("avatar:N") or null
 * @param {string}      initials - 1-2 letter fallback
 * @param {number}      size     - diameter in px (default 96)
 * @param {string}      fontSize - fallback initials font size (default "2rem")
 * @param {boolean}     shadow   - whether to show glow shadow (default true)
 */
export function AvatarDisplay({ avatar, initials, size = 96, fontSize = '2rem', shadow = true }) {
  const preset = avatar?.startsWith('avatar:') ? getPreset(avatar) : null;

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: shadow ? '0 0 30px rgba(124,58,237,0.4)' : 'none',
    overflow: 'hidden',
    background: preset
      ? preset.gradient
      : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
  };

  // Preset emoji avatar
  if (preset) {
    return (
      <div style={baseStyle}>
        <span style={{ fontSize: Math.round(size * 0.42) }}>{preset.emoji}</span>
      </div>
    );
  }

  // Uploaded photo (base64)
  if (avatar && !avatar.startsWith('avatar:')) {
    return (
      <div style={{ ...baseStyle, background: 'none' }}>
        <img
          src={avatar}
          alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  // Initials fallback
  return (
    <div style={baseStyle}>
      <span style={{ fontSize, fontWeight: 900, color: '#fff' }}>{initials}</span>
    </div>
  );
}
