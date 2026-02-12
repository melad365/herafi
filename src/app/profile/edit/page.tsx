import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ProfileEditForm from "@/components/forms/ProfileEditForm";

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { portfolioImages: { orderBy: { order: "asc" } } },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>
        <ProfileEditForm user={user} />
      </div>
    </div>
  );
}
