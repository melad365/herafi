"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface TabNavigationProps {
  activeTab?: string
}

export default function TabNavigation({ activeTab = "gigs" }: TabNavigationProps) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || activeTab

  const tabs = [
    { id: "gigs", label: "My Gigs" },
    { id: "orders", label: "Orders" },
    { id: "messages", label: "Messages" },
  ]

  return (
    <div className="bg-white rounded-lg shadow px-6 mb-6">
      <nav className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id

          return (
            <Link
              key={tab.id}
              href={`/provider/dashboard?tab=${tab.id}`}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                isActive
                  ? "border-burgundy-800 text-burgundy-800"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
