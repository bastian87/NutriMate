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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuthContext()
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log("Form submitted with:", { email, fullName })

    try {
      console.log("Calling signUp...")
      await signUp(email, password, fullName)
      console.log("SignUp completed successfully")

      // Always show confirmation dialog after successful signup
      setShowConfirmation(true)
      console.log("Confirmation dialog should now show")
    } catch (err) {
      console.error("SignUp error:", err)
      setError(err instanceof Error ? err.message : "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmationClose = () => {
    console.log("Confirmation dialog closing, redirecting to onboarding")
    setShowConfirmation(false)
    router.push("/onboarding")
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Create Your NutriMate Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
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
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>

          {/* Debug info */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <p>Debug: Email: {email}</p>
              <p>Debug: Loading: {loading.toString()}</p>
              <p>Debug: Error: {error || "none"}</p>
              <p>Debug: Show Confirmation: {showConfirmation.toString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render confirmation dialog outside the card */}
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={(open) => {
          if (!open) {
            handleConfirmationClose()
          }
        }}
        email={email}
      />
    </>
  )
}
