'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/gigs?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/gigs');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What service are you looking for?"
        className="w-full pl-12 pr-28 py-3 rounded-full bg-white text-gray-900 text-sm placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:border-burgundy-400 focus:ring-1 focus:ring-burgundy-400 transition-colors"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-burgundy-800 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-burgundy-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
