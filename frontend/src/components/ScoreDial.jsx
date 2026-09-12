import React from 'react';
import { cn } from '@/lib/utils';

export const ScoreDial = ({ score, size = 'md', className }) => {
  const sizes = {
    sm: { width: 64, stroke: 4, fontSize: 'text-lg' },
    md: { width: 100, stroke: 6, fontSize: 'text-3xl' },
    lg: { width: 160, stroke: 8, fontSize: 'text-5xl' }
  };

  const config = sizes[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return 'rgb(16, 185, 129)';
    if (score <= 40) return 'rgb(251, 191, 36)';
    return 'rgb(148, 163, 184)';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={config.width} height={config.width} className="transform -rotate-90">
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          className="text-border"
        />
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={config.stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="dial-ring transition-all duration-600"
        />
      </svg>
      <div className={cn('absolute inset-0 flex items-center justify-center', config.fontSize, 'font-bold')}
        style={{ color: getColor() }}>
        {score}
      </div>
    </div>
  );
};