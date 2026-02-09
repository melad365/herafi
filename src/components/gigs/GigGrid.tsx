import GigCard from "./GigCard";

interface GigCardProps {
  slug: string;
  title: string;
  images: string[];
  category: string;
  pricingTiers: any;
  provider: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface GigGridProps {
  gigs: GigCardProps[];
  emptyMessage?: string;
}

export default function GigGrid({
  gigs,
  emptyMessage = "No services found",
}: GigGridProps) {
  if (gigs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {gigs.map((gig) => (
        <GigCard key={gig.slug} {...gig} />
      ))}
    </div>
  );
}
