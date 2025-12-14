'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SearchBox({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  size = 'md',
  className
}: SearchBoxProps) {
  const [query, setQuery] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={clsx("relative", className)}>
      <div className="relative">
        <MagnifyingGlassIcon 
          className={clsx(
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none",
            {
              "h-4 w-4": size === 'sm',
              "h-5 w-5": size === 'md',
              "h-6 w-6": size === 'lg'
            }
          )} 
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={clsx(
            "block w-full rounded-lg border-0 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#8F210E] transition-all duration-200",
            {
              "pl-9 pr-3 py-2 text-sm": size === 'sm',
              "pl-10 pr-4 py-2.5 text-sm": size === 'md',
              "pl-12 pr-4 py-3 text-base": size === 'lg'
            }
          )}
        />
      </div>
    </form>
  );
}