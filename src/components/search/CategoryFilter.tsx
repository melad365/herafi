"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface CategoryFilterProps {
  currentCategory?: string;
}

// Human-readable labels for categories
const CATEGORY_LABELS: Record<string, string> = {
  PLUMBING: "Plumbing",
  PAINTING: "Painting",
  CLEANING: "Cleaning",
  CARPENTRY: "Carpentry",
  WELDING: "Welding",
  ELECTRICAL: "Electrical",
  HVAC: "HVAC",
  LANDSCAPING: "Landscaping",
  MOVING: "Moving",
  CAR_WASHING: "Car Washing",
  DIGITAL_DESIGN: "Digital Design",
  DIGITAL_WRITING: "Digital Writing",
  OTHER: "Other",
};

export default function CategoryFilter({
  currentCategory = "",
}: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    // Reset to page 1 when category changes
    params.delete("page");

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentCategory}
      onChange={handleChange}
      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
    >
      <option value="">All Categories</option>
      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
