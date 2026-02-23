import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const session = await auth();

  // Require authentication
  if (!session) {
    redirect("/login");
  }

  // Query user to get username
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  // Redirect to public profile if username exists, otherwise prompt setup
  if (user?.username) {
    redirect(`/u/${user.username}`);
  } else {
    redirect("/profile/edit");
  }
}
