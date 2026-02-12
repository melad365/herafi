import Link from "next/link";
import { auth } from "@/lib/auth";
import MobileNav from "./MobileNav";

export default async function Header() {
  const session = await auth();

  // Check if user is a provider by querying their profile
  let isProvider = false;
  if (session?.user?.id) {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isProvider: true },
    });
    isProvider = user?.isProvider ?? false;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-burgundy-900 hover:text-burgundy-800 transition-colors">
          Herafi
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/gigs"
            className="text-gray-700 hover:text-burgundy-800 transition-colors duration-200 font-medium"
          >
            Browse
          </Link>
        </nav>

        {/* Desktop Auth/User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {!session ? (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-burgundy-800 transition-colors duration-200 font-medium"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="bg-burgundy-800 text-white px-4 py-2 rounded-lg hover:bg-burgundy-900 transition-colors duration-200 font-medium"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-burgundy-800 transition-colors duration-200 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/messages"
                className="text-gray-700 hover:text-burgundy-800 transition-colors duration-200 font-medium"
              >
                Messages
              </Link>
              {isProvider && (
                <Link
                  href="/provider/dashboard"
                  className="text-gray-700 hover:text-burgundy-800 transition-colors duration-200 font-medium"
                >
                  Provider Dashboard
                </Link>
              )}
              <div className="w-9 h-9 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-900 font-semibold">
                {session.user?.name?.charAt(0).toUpperCase() ?? session.user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          isLoggedIn={!!session}
          isProvider={isProvider}
          username={session?.user?.name ?? null}
        />
      </div>
    </header>
  );
}
