"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "./auth-provider"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creatingTestUser, setCreatingTestUser] = useState(false)
  const { signIn } = useAuthContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (err) {
      console.error("Login error:", err)

      // Provide more user-friendly error messages
      let errorMessage = "Failed to sign in"

      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and click the confirmation link before signing in."
        } else if (err.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment and try again."
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setCreatingTestUser(true)
    setError(null)

    try {
      const response = await fetch("/api/create-test-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok) {
        setEmail("test@nutrimate.com")
        setPassword("testpassword123")
        setError(null)
        // Show success message
        alert("Test user created successfully! You can now log in with the test credentials.")
      } else {
        setError(result.error || "Failed to create test user")
      }
    } catch (error) {
      console.error("Error creating test user:", error)
      setError("Failed to create test user")
    } finally {
      setCreatingTestUser(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Sign In to NutriMate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm space-y-2">
              <div>
                Don't have an account?{" "}
                <Link href="/signup" className="text-orange-600 hover:underline">
                  Sign up
                </Link>
              </div>

              {/* Test credentials for development */}
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-xs text-blue-800 font-medium mb-2">For Testing:</p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={createTestUser}
                    disabled={creatingTestUser}
                  >
                    {creatingTestUser ? "Creating Test User..." : "Create Test User"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setEmail("test@nutrimate.com")
                      setPassword("testpassword123")
                    }}
                  >
                    Use Test Credentials
                  </Button>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Email: test@nutrimate.com
                  <br />
                  Password: testpassword123
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
