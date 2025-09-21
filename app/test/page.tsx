"use client"

import { useAuthContext } from "@/components/auth/simple-auth-provider"

export default function TestPage() {
  const { user, loading } = useAuthContext()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="text-gray-600 mb-2">Loading: {loading ? "Yes" : "No"}</p>
        <p className="text-gray-600">User: {user ? user.email : "No user"}</p>
        <p className="text-gray-600">User ID: {user ? user.id : "No ID"}</p>
      </div>
    </div>
  )
}
