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
import { supabase } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}/auth/callback`
        : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if (error) throw error;
    } catch (err) {
      setError('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        {/* Botón Volver a Landing */}
        <div className="mb-4">
          <Link href="/landing">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Landing
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In to NutriMate</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full mb-4 flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              disabled={loading}
              variant="outline"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.69 30.74 0 24 0 14.82 0 6.71 5.13 2.69 12.56l7.98 6.19C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.74A14.5 14.5 0 019.5 24c0-1.65.28-3.24.77-4.74l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.34 2.49 10.49l8.18-5.75z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.14 15.89-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-8.7 2.16-6.38 0-11.87-3.59-14.33-8.75l-8.18 5.75C6.71 42.87 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Iniciar sesión con Google
            </Button>
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
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
