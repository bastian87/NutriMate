"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "./simple-auth-provider"
import Link from "next/link"
import { Eye, EyeOff, User, ExternalLink } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { supabase } from "@/lib/supabase/client"

export default function SignupFormNew() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const { signUp } = useAuthContext()
  const router = useRouter()

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError("Username must be at least 3 characters long")
      return false
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 3-20 characters long and contain only letters, numbers, and underscores")
      return false
    }

    setCheckingUsername(true)
    try {
      const response = await fetch('/api/user/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()
      
      if (data.available) {
        setUsernameError(null)
        return true
      } else {
        setUsernameError("Username is already taken")
        return false
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameError("Error checking username availability")
      return false
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setUsernameError(null)

    // Debounce the username check
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  const validateForm = () => {
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters long")
      return false
    }

    if (usernameError) {
      setError("Please fix the username error")
      return false
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (!agreeToTerms) {
      setError("You must agree to the Terms of Service")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // Guardar datos en localStorage antes de crear la cuenta
      const signupData = {
        username,
        email,
        password,
        full_name: username, // Usar username como full_name inicial
        fromSignup: true
      }
      
      console.log("💾 Saving signup data to localStorage:", signupData)
      localStorage.setItem('nutrimate_signup_data', JSON.stringify(signupData))

      const result = await signUp(email, password, username, username)
      
      if (result.error) {
        setError(result.error.message || 'An error occurred')
        return
      }

      // Redirect to onboarding
      router.push("/onboarding")
      
    } catch (error) {
      console.error("Error during signup:", error)
      setError("Error creating account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
      if (error) {
        throw error;
      }
    } catch (err) {
      setError('Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🥕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register</h1>
        </div>
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            required
            disabled={loading}
            placeholder="Choose a username"
            className={usernameError ? "border-red-500" : ""}
            autoComplete="username"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {checkingUsername && (
            <p className="text-sm text-blue-600">Checking availability...</p>
          )}
          {usernameError && (
            <p className="text-sm text-red-600">{usernameError}</p>
          )}
          {username && !usernameError && !checkingUsername && (
            <p className="text-sm text-green-600">✓ Username available</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter your email address"
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              placeholder="Create a password (min. 6 characters)"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              placeholder="Confirm your password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
            I agree to the{" "}
            <Link href="/terms-of-service" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              Terms of Service
              <ExternalLink className="w-3 h-3" />
            </Link>
          </Label>
        </div>

        {/* Create Account Button */}
        <Button 
          type="submit" 
          className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          disabled={loading}
        >
          <User className="w-4 h-4" />
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.69 30.74 0 24 0 14.82 0 6.71 5.13 2.69 12.56l7.98 6.19C12.13 13.09 17.62 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/>
              <path fill="#FBBC05" d="M10.67 28.74A14.5 14.5 0 019.5 24c0-1.65.28-3.24.77-4.74l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.34 2.49 10.49l8.18-5.75z"/>
              <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.14 15.89-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-8.7 2.16-6.38 0-11.87-3.59-14.33-8.75l-8.18 5.75C6.71 42.87 14.82 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </g>
          </svg>
          Google
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center space-y-2">
        <div className="flex justify-center space-x-4 text-sm">
          <Link href="/terms-of-service" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          ©2025 NutriMate, Inc.
        </p>
      </div>
    </div>
  )
}
