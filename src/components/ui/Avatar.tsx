'use client';

import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallback?: React.ReactNode;
}

export function Avatar({ 
  src, 
  alt = "", 
  size = 'md', 
  className,
  fallback 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={clsx(
          "rounded-full object-cover ring-2 ring-white shadow-sm",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div className={clsx(
      "rounded-full bg-gray-100 flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      {fallback || <UserCircleIcon className="h-5 w-5 text-gray-500" />}
    </div>
  );
}