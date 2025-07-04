"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage()

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-white z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        <Link href="/" onClick={onClose}>
          <Image src="/logo-new.png" alt="Logo" width={100} height={30} priority />
        </Link>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800 focus:outline-none">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="p-4">
        <ul>
          <li className="py-2">
            <Link href="/" onClick={onClose} className="block text-gray-700 hover:text-gray-900">
              {t("mobileNavigation.home")}
            </Link>
          </li>
          <li className="py-2">
            <Link href="/services" onClick={onClose} className="block text-gray-700 hover:text-gray-900">
              {t("mobileNavigation.services")}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default MobileNavigation
