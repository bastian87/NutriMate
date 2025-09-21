"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "./simple-auth-provider"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { supabase } from "@/lib/supabase/client"

export default function SignupForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [resumeSignup, setResumeSignup] = useState(false)
  const [resumeMethod, setResumeMethod] = useState<'email' | 'google' | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")
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
    // Check if the value looks like an email and clear it
    if (value.includes("@") && value.includes(".")) {
      setUsername("")
      setUsernameError(t("auth.usernameNotEmail"))
      return
    }
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate username before proceeding
    const isUsernameValid = checkUsernameAvailability(username)
    if (!isUsernameValid) {
      setLoading(false)
      return
    }

    try {
      const result = await signUp(email, password, fullName, username)
      
      if (result.error) {
        // Check if user already exists
        if (result.error.message?.includes('already registered') || 
            result.error.message?.includes('User already registered') ||
            result.error.message?.includes('already been registered')) {
          setResumeSignup(true)
          setResumeMethod('email')
          setError(null)
          return
        }
        setError(result.error.message || 'An error occurred')
        return
      }

      // Si necesita onboarding, redirigir
      if (result.data?.needsOnboarding) {
        router.push("/onboarding")
        return
      }

      // Si no necesita onboarding (caso raro), ir al dashboard
      router.push("/dashboard")
      
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
        // Check if user already exists
        if (error.message?.includes('already registered') || 
            error.message?.includes('User already registered') ||
            error.message?.includes('already been registered')) {
          setResumeSignup(true)
          setResumeMethod('google')
          setError(null)
          return
        }
        throw error;
      }
    } catch (err) {
      setError('Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeWithPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.user.id)
          .single()

        if (!profile?.username) {
          // Profile incomplete, redirect to onboarding
          router.push('/onboarding')
        } else {
          // Profile complete, redirect to dashboard
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error signing in:', error)
      setError('Error signing in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeWithOTP = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      setOtpSent(true)
    } catch (error) {
      console.error('Error sending OTP:', error)
      setError('Error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.user.id)
          .single()

        if (!profile?.username) {
          // Profile incomplete, redirect to onboarding
          router.push('/onboarding')
        } else {
          // Profile complete, redirect to dashboard
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setError('Error verifying OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeWithGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      const redirectTo = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}/auth/callback`
        : undefined
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })

      if (error) {
        setError(error.message)
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError('Error signing in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetResumeState = () => {
    setResumeSignup(false)
    setResumeMethod(null)
    setOtpSent(false)
    setOtpCode("")
    setError(null)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Botón Volver a Landing */}
      <div className="mb-4">
        <Link href="/landing">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("auth.backToLanding")}
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {resumeSignup ? "Resume Your Signup" : "Create Your NutriMate Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resumeSignup ? (
            // Resume Signup State
            <div className="space-y-6">
              <Alert>
                <AlertDescription>
                  An account with this email already exists. Please sign in to continue.
                </AlertDescription>
              </Alert>

              {resumeMethod === 'email' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Choose how you&apos;d like to sign in:
                        </p>
                      </div>
                      
                      <form onSubmit={handleResumeWithPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resume-email">Email</Label>
                          <Input
                            id="resume-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter your email address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resume-password">Password</Label>
                          <Input
                            id="resume-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter your password"
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Signing in..." : "Sign in with Password"}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleResumeWithOTP}
                        className="w-full"
                        disabled={loading}
                        variant="outline"
                      >
                        {loading ? "Sending..." : "Sign in with Email Link"}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleOTPVerification} className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          We&apos;ve sent a verification code to {email}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otp-code">Verification Code</Label>
                        <Input
                          id="otp-code"
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                          disabled={loading}
                          placeholder="Enter verification code"
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Verifying..." : "Verify Code"}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-full"
                        variant="outline"
                        disabled={loading}
                      >
                        Back to Sign In Options
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {resumeMethod === 'google' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Sign in with Google to continue:
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleResumeWithGoogle}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                    variant="outline"
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.69 30.74 0 24 0 14.82 0 6.71 5.13 2.69 12.56l7.98 6.19C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.74A14.5 14.5 0 019.5 24c0-1.65.28-3.24.77-4.74l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.34 2.49 10.49l8.18-5.75z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.14 15.89-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-8.7 2.16-6.38 0-11.87-3.59-14.33-8.75l-8.18 5.75C6.71 42.87 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                    Sign in with Google
                  </Button>
                </div>
              )}

              <div className="text-center">
                <Button
                  type="button"
                  onClick={resetResumeState}
                  variant="ghost"
                  className="text-sm"
                >
                  ← Back to Sign Up
                </Button>
              </div>
            </div>
          ) : (
            // Normal Signup State
            <>
              <Button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full mb-4 flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                disabled={loading}
                variant="outline"
              >
                <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.69 30.74 0 24 0 14.82 0 6.71 5.13 2.69 12.56l7.98 6.19C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.74A14.5 14.5 0 019.5 24c0-1.65.28-3.24.77-4.74l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.34 2.49 10.49l8.18-5.75z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.14 15.89-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-8.7 2.16-6.38 0-11.87-3.59-14.33-8.75l-8.18 5.75C6.71 42.87 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                Registrarse con Google
              </Button>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{t("account.username")}</Label>
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
                    placeholder="Create a password (min. 10 characters)"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500 hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
