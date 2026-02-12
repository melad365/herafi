import { Suspense } from "react";
import { Category } from "@prisma/client";
import { searchGigs } from "@/lib/search";
import GigGrid from "@/components/gigs/GigGrid";
import FilterPanel from "@/components/search/FilterPanel";
import Pagination from "@/components/search/Pagination";

interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

// Category labels for display
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

export default async function GigsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params
  const query = params.q;
  const categoryParam = params.category;
  const minPriceParam = params.minPrice;
  const maxPriceParam = params.maxPrice;
  const pageParam = params.page;

  // Validate category
  const validCategories = Object.values(Category);
  const category =
    categoryParam && validCategories.includes(categoryParam as Category)
      ? (categoryParam as Category)
      : undefined;

  // Parse price range
  const minPrice = minPriceParam ? parseInt(minPriceParam, 10) : undefined;
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam, 10) : undefined;

  // Parse page number
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

  // Search gigs
  const { gigs, totalPages } = await searchGigs(
    { query, category, minPrice, maxPrice },
    page
  );

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-burgundy-900 mb-2">
            Browse Services
          </h1>
        {category && (
          <p className="text-gray-600">
            Showing: <span className="font-semibold">{CATEGORY_LABELS[category]}</span>
          </p>
        )}
      </div>

      {/* Filter panel */}
      <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse" />}>
        <div className="mb-8">
          <FilterPanel
            query={query}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>
      </Suspense>

      {/* Results */}
      <GigGrid gigs={gigs} />

        {/* Pagination */}
        <Suspense>
          <Pagination currentPage={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
