import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants = {
  primary:
    'bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20',
  secondary:
    'bg-white/5 hover:bg-white/10 border border-white/10 text-white',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center gap-2 rounded-xl font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
