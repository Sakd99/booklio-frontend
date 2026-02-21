import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: Props) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, borderColor: 'rgba(59,130,246,0.3)' } : undefined}
      className={`glass-card rounded-2xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
