"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TestUserPanel from "@/components/admin/test-user-panel"
import { useAuthContext } from "@/components/auth/auth-provider"

export default function TestUsersPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      // In a real app, you'd check if the user is an admin
      // For now, we'll allow access in development mode
      if (process.env.NODE_ENV === "development" || user?.email?.includes("admin")) {
        setIsAuthorized(true)
      } else {
        router.push("/")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test User Management</h1>
        <p className="text-gray-600">Create and manage test users for development and testing purposes.</p>
      </div>
      <TestUserPanel />
    </div>
  )
}
