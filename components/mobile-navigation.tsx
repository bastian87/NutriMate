"use client"

import Link from "next/link"
import { Home, Search, Clock, Bookmark } from "lucide-react"
import { usePathname } from "next/navigation"

export default function MobileNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
      <div className="flex justify-between items-center">
        <Link
          href="/mobile"
          className={`flex flex-col items-center ${isActive("/mobile") && !isActive("/mobile/recipes") && !isActive("/mobile/recipe-box") && !isActive("/mobile/search") ? "text-orange-600" : "text-gray-600"}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Browse</span>
        </Link>
        <Link
          href="/mobile/search"
          className={`flex flex-col items-center ${isActive("/mobile/search") ? "text-orange-600" : "text-gray-600"}`}
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link
          href="/mobile/recently-viewed"
          className={`flex flex-col items-center ${isActive("/mobile/recently-viewed") ? "text-orange-600" : "text-gray-600"}`}
        >
          <Clock className="h-6 w-6" />
          <span className="text-xs mt-1">Recently Viewed</span>
        </Link>
        <Link
          href="/mobile/recipe-box"
          className={`flex flex-col items-center ${isActive("/mobile/recipe-box") ? "text-orange-600" : "text-gray-600"}`}
        >
          <Bookmark className="h-6 w-6" />
          <span className="text-xs mt-1">Recipe Box</span>
        </Link>
      </div>
    </div>
  )
}
