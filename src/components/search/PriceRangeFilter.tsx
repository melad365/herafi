"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
}

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
}: PriceRangeFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [min, setMin] = useState(minPrice?.toString() ?? "");
  const [max, setMax] = useState(maxPrice?.toString() ?? "");

  // Sync with URL when props change
  useEffect(() => {
    setMin(minPrice?.toString() ?? "");
    setMax(maxPrice?.toString() ?? "");
  }, [minPrice, maxPrice]);

  const updatePriceParams = useDebouncedCallback(
    (minVal: string, maxVal: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (minVal.trim()) {
        params.set("minPrice", minVal.trim());
      } else {
        params.delete("minPrice");
      }

      if (maxVal.trim()) {
        params.set("maxPrice", maxVal.trim());
      } else {
        params.delete("maxPrice");
      }

      // Reset to page 1 when price range changes
      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`);
    },
    500
  );

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMin(value);
    updatePriceParams(value, max);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMax(value);
    updatePriceParams(min, value);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <label htmlFor="minPrice" className="sr-only">
          Minimum Price
        </label>
        <input
          type="number"
          id="minPrice"
          value={min}
          onChange={handleMinChange}
          placeholder="Min $"
          min="0"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <span className="text-gray-400">-</span>
      <div className="flex-1">
        <label htmlFor="maxPrice" className="sr-only">
          Maximum Price
        </label>
        <input
          type="number"
          id="maxPrice"
          value={max}
          onChange={handleMaxChange}
          placeholder="Max $"
          min="0"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
