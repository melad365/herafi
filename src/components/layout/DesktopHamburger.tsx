"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useClickOutside } from "./hooks/useClickOutside";

interface DesktopHamburgerProps {
  isLoggedIn: boolean;
  isProvider: boolean;
}

export default function DesktopHamburger({ isLoggedIn, isProvider }: DesktopHamburgerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  // Auto-close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMenu();
    }
  };

  return (
    <div className="hidden md:block" ref={menuRef}>
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        className="p-2 text-gray-700 hover:text-burgundy-800 transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Desktop Hamburger Menu */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-lg z-40">
          <nav
            role="menu"
            className="max-w-7xl mx-auto px-4 py-6"
          >
            {/* Browse Section - Always Visible */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                Browse
              </h3>
              <Link
                href="/gigs"
                onClick={closeMenu}
                role="menuitem"
                className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Browse Services
              </Link>
              <Link
                href="/categories"
                onClick={closeMenu}
                role="menuitem"
                className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Categories
              </Link>
            </div>

            {/* Account Section - Logged In Only */}
            {isLoggedIn && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  Account
                </h3>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  role="menuitem"
                  className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  onClick={closeMenu}
                  role="menuitem"
                  className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Messages
                </Link>
                <Link
                  href="/orders"
                  onClick={closeMenu}
                  role="menuitem"
                  className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Orders
                </Link>
              </div>
            )}

            {/* Provider Section - Provider Only */}
            {isLoggedIn && isProvider && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  Provider
                </h3>
                <Link
                  href="/provider/gigs"
                  onClick={closeMenu}
                  role="menuitem"
                  className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  My Gigs
                </Link>
              </div>
            )}

            {/* Help Section - Always Visible */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                Help
              </h3>
              <Link
                href="/help"
                onClick={closeMenu}
                role="menuitem"
                className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Help
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
