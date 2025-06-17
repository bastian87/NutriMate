"use client"
import Link from "next/link"
import { Search } from "lucide-react"
import Image from "next/image"

export default function MobileHeader() {
  return (
    <header className="bg-cream-50 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-4 py-1 text-xs text-gray-700">
          <div>9.41</div>
          <div className="flex space-x-1">
            <div className="flex items-center">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 4.5C1 2.84315 2.34315 1.5 4 1.5H14C15.6569 1.5 17 2.84315 17 4.5V7.5C17 9.15685 15.6569 10.5 14 10.5H4C2.34315 10.5 1 9.15685 1 7.5V4.5Z"
                  stroke="black"
                  strokeWidth="1.5"
                />
                <path d="M17.5 5.5V6.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-center">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 2.5C1 1.67157 1.67157 1 2.5 1H13.5C14.3284 1 15 1.67157 15 2.5V9.5C15 10.3284 14.3284 11 13.5 11H2.5C1.67157 11 1 10.3284 1 9.5V2.5Z"
                  stroke="black"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 3.5L4 8.5M8 5.5L8 8.5M12 3.5L12 8.5"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex items-center">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 1.5C11.4853 1.5 13.5 3.51472 13.5 6C13.5 8.48528 11.4853 10.5 9 10.5C6.51472 10.5 4.5 8.48528 4.5 6C4.5 3.51472 6.51472 1.5 9 1.5Z"
                  stroke="black"
                  strokeWidth="1.5"
                />
                <path
                  d="M1.5 6H2.5M15.5 6H16.5M9 1.5V0.5M9 11.5V10.5"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mt-5">
          <Image src="/logo-new.png" alt="NutriMate Logo" width={40} height={40} className="rounded-lg" />
        </Link>

        {/* Greeting */}
        <div className="text-center mt-5">
          <h1 className="text-xl font-semibold">HI, SAM</h1>
        </div>

        {/* Search Icon */}
        <button className="mt-5">
          <Search className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
