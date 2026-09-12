import React from 'react';
import { cn } from '@/lib/utils';

export const SkillPill = ({ skill, variant = 'default', className }) => {
  const variants = {
    default: 'bg-secondary text-secondary-foreground',
    attention: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    positive: 'bg-accent/10 text-accent border border-accent/20'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
        variants[variant],
        className
      )}
    >
      {skill}
    </span>
  );
};