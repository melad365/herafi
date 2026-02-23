import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/reviews/StarRating";

interface GigCardProps {
  slug: string;
  title: string;
  images: string[];
  category: string;
  pricingTiers: any; // JSONB
  averageRating?: number;
  totalReviews?: number;
  provider: {
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export default function GigCard({
  slug,
  title,
  images,
  category,
  pricingTiers,
  averageRating = 0,
  totalReviews = 0,
  provider,
}: GigCardProps) {
  // Extract starting price from basic tier
  const startingPrice = pricingTiers?.basic?.price ?? 0;
  const firstImage = images[0];
  const providerName = provider.displayName || provider.username || "Anonymous";

  return (
    <Link
      href={`/gigs/${slug}`}
      className="block rounded-xl border border-gray-200 overflow-hidden hover:shadow-card-hover hover:border-burgundy-300 transition-all duration-200"
    >
      {/* Image area */}
      <div className="aspect-video bg-gray-100 relative">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="p-4 space-y-2">
        {/* Category label */}
        <div className="text-xs uppercase text-gray-600 tracking-wide">
          {category.replace(/_/g, " ")}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-burgundy-800 transition-colors duration-200">
          {title}
        </h3>

        {/* Provider info */}
        <div className="flex items-center gap-2 pt-1">
          {provider.avatarUrl ? (
            <img
              src={provider.avatarUrl}
              alt={providerName}
              className="w-6 h-6 rounded-full border border-burgundy-200 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
              {providerName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-700">{providerName}</span>
        </div>

        {/* Rating */}
        {totalReviews > 0 ? (
          <div className="pt-1">
            <StarRating rating={averageRating} size="sm" showNumber />
          </div>
        ) : (
          <div className="pt-1">
            <span className="inline-block text-xs px-2 py-1 bg-burgundy-100 text-burgundy-800 rounded-full font-medium">New</span>
          </div>
        )}

        {/* Price */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-600">Starting at</div>
          <div className="text-lg font-bold text-burgundy-800">
            ${startingPrice}
          </div>
        </div>
      </div>
    </Link>
  );
}
