/**
 * Skeleton.jsx — Shimmer loading skeleton blocks
 */
export function SkeletonLine({ width = 'full', height = '4', className = '' }) {
  return (
    <div
      className={`
        shimmer rounded-lg bg-white/5
        h-${height} w-${width === 'full' ? 'full' : width}
        ${className}
      `}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass rounded-2xl p-5 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="shimmer w-10 h-10 rounded-xl bg-white/5" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="32" height="3" />
          <SkeletonLine width="24" height="3" />
        </div>
      </div>
      <SkeletonLine height="8" />
      <SkeletonLine width="3/4" height="3" />
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16', xl: 'w-24 h-24' };
  return (
    <div className={`shimmer rounded-full bg-white/5 ${sizes[size]}`} />
  );
}

export default function Skeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? '3/4' : 'full'} />
      ))}
    </div>
  );
}
