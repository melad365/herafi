import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ProviderSetupForm from "@/components/forms/ProviderSetupForm";

export default async function ProviderSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, isProvider: true },
  });

  if (!user) redirect("/login");
  if (!user.username) redirect("/profile/edit");
  if (user.isProvider) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Provider</h1>
        <p className="text-gray-600 mb-8">Share your expertise and start offering services on Herafi.</p>
        <ProviderSetupForm />
      </div>
    </div>
  );
}
