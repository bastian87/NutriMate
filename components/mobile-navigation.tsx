"use client"
import { usePathname } from "next/navigation"

export default function MobileNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
  }

  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50"></div>
}
