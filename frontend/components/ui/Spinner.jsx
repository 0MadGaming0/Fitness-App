/**
 * Spinner.jsx — Loading spinner with size variants
 */
import { motion } from 'framer-motion';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      className={`
        ${sizes[size]}
        rounded-full
        border-violet-600/20
        border-t-violet-500
        ${className}
      `}
      style={{ borderStyle: 'solid' }}
    />
  );
}
