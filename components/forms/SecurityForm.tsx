"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Shield, Key, Smartphone } from "lucide-react"

interface SecurityFormProps {
  user: any
}

export default function SecurityForm({ user }: SecurityFormProps) {
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const { toast } = useToast()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTwoFactorEnabled(enabled)
      toast({
        title: enabled ? "2FA Enabled" : "2FA Disabled",
        description: enabled
          ? "Two-factor authentication has been enabled for your account."
          : "Two-factor authentication has been disabled for your account.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                placeholder="Enter your new password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                placeholder="Confirm your new password"
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Enable 2FA</h3>
              <p className="text-sm text-muted-foreground">Secure your account with two-factor authentication</p>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} disabled={loading} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>Monitor your account security and recent activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Last Login</h3>
                <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Login Location</h3>
                <p className="text-sm text-muted-foreground">New York, NY</p>
              </div>
            </div>

            <Button variant="outline">View Login History</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
