"use client";

import { useState } from "react";
import Link from "next/link";
import { useClickOutside } from "./hooks/useClickOutside";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface UserDropdownProps {
  user: {
    name: string | null;
    email: string | null;
    avatar: string; // First letter of name/email, uppercase
  };
  isProvider: boolean;
}

export default function UserDropdown({ user, isProvider }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeDropdown = () => setIsOpen(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const ref = useClickOutside<HTMLDivElement>(closeDropdown);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeDropdown();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    }
  };

  const displayName = user.name || "User";

  return (
    <div ref={ref} className="relative">
      {/* Toggle Button */}
      <button
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-burgundy-500 rounded-full"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-900 font-semibold">
          {user.avatar}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">
              {displayName}
            </div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>

          {/* Provider Mode Indicator */}
          {isProvider && (
            <div className="px-4 py-2 border-b border-gray-200 bg-burgundy-50">
              <div className="text-xs font-medium text-burgundy-900">
                Provider Mode Active
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={closeDropdown}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              role="menuitem"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={closeDropdown}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              role="menuitem"
            >
              Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 pt-2">
            <Link
              href="/api/auth/signout"
              onClick={closeDropdown}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              role="menuitem"
            >
              Sign Out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
