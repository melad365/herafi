import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateGig } from "@/actions/gigs";
import GigForm from "@/components/forms/GigForm";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditGigPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { slug } = await params;

  // Load gig
  const gig = await prisma.gig.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      images: true,
      pricingTiers: true,
      providerId: true,
    },
  });

  if (!gig) {
    notFound();
  }

  // Verify ownership
  if (gig.providerId !== session.user.id) {
    redirect(`/gigs/${slug}`);
  }

  // Convert pricingTiers from Json to proper type
  const pricingTiers = gig.pricingTiers as any;

  return (
    <GigForm
      mode="edit"
      initialData={{
        title: gig.title,
        description: gig.description,
        category: gig.category,
        pricingTiers,
        slug: gig.slug,
        images: gig.images,
      }}
      action={updateGig.bind(null, gig.slug)}
    />
  );
}
