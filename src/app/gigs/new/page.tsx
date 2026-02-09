import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGig } from "@/actions/gigs";
import GigForm from "@/components/forms/GigForm";

export default async function CreateGigPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Check if user is a provider
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isProvider: true },
  });

  if (!user?.isProvider) {
    redirect("/provider/setup");
  }

  return <GigForm mode="create" action={createGig} />;
}
