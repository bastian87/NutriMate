"use client"

import { UserProfileDebug } from "@/components/user-profile-debug"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TestUserProfilePage() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You need to be logged in to view your user profile information.
            </p>
            <div className="space-y-2">
              <Link href="/login" className="w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button variant="outline" className="w-full">Create Account</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-orange-600 hover:text-orange-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Profile Debug</h1>
        <p className="text-gray-600">
          This page shows all the user profile data loaded by the UserProfileContext.
          Use this to verify that the context is working correctly and all data is being loaded.
        </p>
      </div>

      <UserProfileDebug />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              This page demonstrates the UserProfileContext functionality:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Centralized Data Loading:</strong> All user data is loaded in one request</li>
              <li>• <strong>Local Storage Caching:</strong> Data is cached for faster subsequent loads</li>
              <li>• <strong>Real-time Updates:</strong> Data is updated when user profile changes</li>
              <li>• <strong>Feature Access Control:</strong> Easy checking of user permissions</li>
              <li>• <strong>Premium Status:</strong> Instant access to subscription information</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 