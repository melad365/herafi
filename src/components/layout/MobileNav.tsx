"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface MobileNavProps {
  isLoggedIn: boolean;
  isProvider: boolean;
  username: string | null;
}

export default function MobileNav({ isLoggedIn, isProvider, username }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-700 hover:text-burgundy-800 transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {/* Browse Link */}
            <Link
              href="/gigs"
              onClick={closeMenu}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive("/gigs")
                  ? "bg-burgundy-50 text-burgundy-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Browse
            </Link>

            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/login")
                      ? "bg-burgundy-50 text-burgundy-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="bg-burgundy-800 text-white px-4 py-2 rounded-lg hover:bg-burgundy-900 transition-colors font-medium text-center"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* User Info */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-900 font-semibold">
                      {username?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                    <span className="font-medium text-gray-900">
                      {username ?? "User"}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-burgundy-50 text-burgundy-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  onClick={closeMenu}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/messages")
                      ? "bg-burgundy-50 text-burgundy-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Messages
                </Link>
                {isProvider && (
                  <Link
                    href="/provider/dashboard"
                    onClick={closeMenu}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive("/provider/dashboard")
                        ? "bg-burgundy-50 text-burgundy-900"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Provider Dashboard
                  </Link>
                )}
                <Link
                  href="/api/auth/signout"
                  onClick={closeMenu}
                  className="px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
