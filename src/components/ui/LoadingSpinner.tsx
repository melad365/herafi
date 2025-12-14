'use client';

import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = '#8F210E' 
}: LoadingSpinnerProps) {
  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-2 border-gray-300",
        {
          'h-4 w-4': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-12 w-12': size === 'lg'
        },
        className
      )}
      style={{
        borderTopColor: color,
        borderRightColor: color
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}