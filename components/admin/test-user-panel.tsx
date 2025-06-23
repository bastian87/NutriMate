"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Trash2, TestTube } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface TestUser {
  email: string
  plan: "free" | "premium"
  status: string
  features: string[]
}

const testUsers: TestUser[] = [
  {
    email: "john.free@nutrimate.test",
    plan: "free",
    status: "active",
    features: ["3 AI suggestions/day", "1 meal plan", "Basic recipes"],
  },
  {
    email: "jane.premium@nutrimate.test",
    plan: "premium",
    status: "active",
    features: ["Unlimited AI suggestions", "Unlimited meal plans", "Advanced nutrition insights", "Export features"],
  },
]

export default function TestUserPanel() {
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useLanguage()

  const handleCreateUsers = async () => {
    setIsCreating(true)
    try {
      // In a real implementation, this would call your test user creation API
      console.log("Creating test users...")
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
      alert("Test users created successfully! Check console for login credentials.")
    } catch (error) {
      console.error("Error creating test users:", error)
      alert("Error creating test users. Check console for details.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUsers = async () => {
    if (!confirm("Are you sure you want to delete all test users? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      // In a real implementation, this would call your test user deletion API
      console.log("Deleting test users...")
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
      alert("Test users deleted successfully!")
    } catch (error) {
      console.error("Error deleting test users:", error)
      alert("Error deleting test users. Check console for details.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          {t('testUserPanel.title')}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('testUserPanel.description')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleCreateUsers} disabled={isCreating} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            {isCreating ? "Creating..." : t('testUserPanel.createTestUsers')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteUsers}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : t('testUserPanel.deleteTestUsers')}
          </Button>
        </div>

        {/* Test Users List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('testUserPanel.availableTestUsers')}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testUsers.map((user) => (
              <Card key={user.email} className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={user.plan === "premium" ? "default" : "secondary"} className="capitalize">
                        {user.plan}
                      </Badge>
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : "destructive"
                        }
                        className="capitalize"
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">Password: testpass123</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('testUserPanel.features')}:</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {user.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{t('testUserPanel.testingInstructions')}:</h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>{t('testUserPanel.testInstructions.1')}</li>
            <li>{t('testUserPanel.testInstructions.2')}</li>
            <li>{t('testUserPanel.testInstructions.3')}</li>
            <li>{t('testUserPanel.testInstructions.4')}</li>
            <li>{t('testUserPanel.testInstructions.5')}</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
