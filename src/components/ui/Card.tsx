import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className = '', hover = false, glow = false }: Props) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, borderColor: 'rgba(59,130,246,0.3)' } : undefined}
      className={`
        glass-card rounded-2xl p-6 transition-all duration-300
        ${glow ? 'glow-blue' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
