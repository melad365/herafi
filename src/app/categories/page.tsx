import { Category } from "@prisma/client";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/components/forms/GigForm";

export default async function CategoriesPage() {
  // Fetch gig counts for all categories using groupBy for efficiency
  const categoryCounts = await prisma.gig.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: { category: true },
  });

  // Convert to Map for O(1) lookups
  const countMap = new Map(
    categoryCounts.map((item) => [item.category, item._count.category])
  );

  // Get all categories from the enum
  const allCategories = Object.values(Category);

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-burgundy-900 mb-2">
            Browse by Category
          </h1>
          <p className="text-gray-600">
            Explore services across all categories
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCategories.map((category) => {
            const gigCount = countMap.get(category) || 0;
            const categoryLabel = CATEGORY_LABELS[category] || category;

            return (
              <Link
                key={category}
                href={`/gigs?category=${category}`}
                className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-gray-200 hover:border-burgundy-300"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {categoryLabel}
                </h2>
                <p className="text-gray-600 text-sm">
                  {gigCount} {gigCount === 1 ? 'service' : 'services'} available
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
