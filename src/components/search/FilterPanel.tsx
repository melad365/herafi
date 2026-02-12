"use client";

import { useRouter, usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import PriceRangeFilter from "./PriceRangeFilter";

interface FilterPanelProps {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function FilterPanel({
  query,
  category,
  minPrice,
  maxPrice,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClearFilters = () => {
    router.replace(pathname);
  };

  const hasFilters = query || category || minPrice !== undefined || maxPrice !== undefined;

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
      {/* Search bar */}
      <SearchBar defaultValue={query} />

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <CategoryFilter currentCategory={category} />
        </div>
        <div className="flex-1">
          <PriceRangeFilter minPrice={minPrice} maxPrice={maxPrice} />
        </div>
      </div>

      {/* Clear filters button */}
      {hasFilters && (
        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="text-sm text-burgundy-600 hover:text-burgundy-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
