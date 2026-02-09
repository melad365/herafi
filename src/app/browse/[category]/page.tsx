import { notFound } from "next/navigation";
import Link from "next/link";
import { Category } from "@prisma/client";
import { prisma } from "@/lib/db";
import GigGrid from "@/components/gigs/GigGrid";

interface PageProps {
  params: Promise<{ category: string }>;
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

export default async function CategoryBrowsePage({ params }: PageProps) {
  const { category: categorySlug } = await params;

  // Convert URL-friendly slug to enum value (e.g., "car-washing" -> "CAR_WASHING")
  const categoryEnum = categorySlug.toUpperCase().replace(/-/g, "_");

  // Validate against Category enum
  const validCategories = Object.values(Category);
  if (!validCategories.includes(categoryEnum as Category)) {
    notFound();
  }

  const category = categoryEnum as Category;
  const categoryLabel = CATEGORY_LABELS[category];

  // Query gigs for this category
  const gigs = await prisma.gig.findMany({
    where: {
      category,
      isActive: true,
    },
    include: {
      provider: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/gigs" className="hover:text-orange-600">
          Browse
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{categoryLabel}</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {categoryLabel} Services
        </h1>
        <p className="text-gray-600">
          Find trusted {categoryLabel.toLowerCase()} professionals in your area
        </p>
      </div>

      {/* Results */}
      <GigGrid
        gigs={gigs}
        emptyMessage={`No ${categoryLabel.toLowerCase()} services available yet`}
      />

      {/* Link to broader search */}
      {gigs.length === 0 && (
        <div className="text-center mt-8">
          <Link
            href="/gigs"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Browse all services
          </Link>
        </div>
      )}
    </div>
  );
}
