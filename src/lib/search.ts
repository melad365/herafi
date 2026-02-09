import { Category, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface GigSearchFilters {
  query?: string;
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
}

export function buildGigSearchWhere(
  filters: GigSearchFilters
): Prisma.GigWhereInput {
  const where: Prisma.GigWhereInput = {
    isActive: true,
  };

  // Full-text search on title and description
  if (filters.query) {
    where.OR = [
      {
        title: {
          search: filters.query,
        },
      },
      {
        description: {
          search: filters.query,
        },
      },
    ];
  }

  // Category filter
  if (filters.category) {
    where.category = filters.category;
  }

  // Price range filter on basic tier
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceConditions: Prisma.JsonFilter<"Gig">[] = [];

    if (filters.minPrice !== undefined) {
      priceConditions.push({
        path: ["basic", "price"],
        gte: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      priceConditions.push({
        path: ["basic", "price"],
        lte: filters.maxPrice,
      });
    }

    // Apply both conditions using array_contains for JSONB
    if (priceConditions.length === 2) {
      where.AND = priceConditions.map((condition) => ({
        pricingTiers: condition,
      }));
    } else {
      where.pricingTiers = priceConditions[0];
    }
  }

  return where;
}

export async function searchGigs(
  filters: GigSearchFilters,
  page = 1,
  pageSize = 12
) {
  const where = buildGigSearchWhere(filters);
  const skip = (page - 1) * pageSize;

  // Determine sort order: relevance for search queries, otherwise newest first
  const orderBy: Prisma.GigOrderByWithRelationInput = filters.query
    ? {
        _relevance: {
          fields: ["title", "description"],
          search: filters.query,
          sort: "desc",
        },
      }
    : { createdAt: "desc" };

  const [gigs, total] = await Promise.all([
    prisma.gig.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.gig.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    gigs,
    total,
    page,
    pageSize,
    totalPages,
  };
}
