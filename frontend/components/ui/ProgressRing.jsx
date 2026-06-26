/**
 * ProgressRing.jsx — SVG circular progress with animated stroke
 */
import { useEffect, useState } from 'react';

export default function ProgressRing({
  progress = 0,       // 0-100
  size = 120,
  strokeWidth = 8,
  color = '#7c3aed',
  trackColor = 'rgba(255,255,255,0.06)',
  label,
  sublabel,
  animate = true,
}) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayProgress / 100) * circumference;

  // Animate from 0 to target progress
  useEffect(() => {
    if (!animate) { setDisplayProgress(progress); return; }
    const timer = setTimeout(() => setDisplayProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress, animate]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={trackColor}
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-xl font-bold text-white">{label}</span>
        )}
        {sublabel && (
          <span className="text-xs text-slate-400 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
