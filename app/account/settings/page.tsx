"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useEffect, useState } from "react"
import ProfileForm from "@/components/forms/ProfileForm"
import HealthForm from "@/components/forms/HealthForm"
import DietForm from "@/components/forms/DietForm"
import BillingForm from "@/components/forms/BillingForm"
import SecurityForm from "@/components/forms/SecurityForm"
import { useRouter } from "next/navigation"

const AccountSettingsPage = () => {
  const { user, loading } = useAuthContext()
  const [userPreferences, setUserPreferences] = useState(null)

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/user/preferences?userId=${user.id}`)
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          const data = await response.json()
          setUserPreferences(data)
        } catch (error) {
          console.error("Failed to fetch user preferences:", error)
          setUserPreferences({})
        }
      }
    }

    fetchUserPreferences()
  }, [user])

  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const handlePreferenceUpdate = (updatedPreferences) => {
    setUserPreferences(updatedPreferences)
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <Tabs defaultValue="profile" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileForm user={user} />
          </TabsContent>
          <TabsContent value="health">
            <HealthForm user={user} initialPreferences={userPreferences} onUpdate={handlePreferenceUpdate} />
          </TabsContent>
          <TabsContent value="diet">
            <DietForm user={user} initialPreferences={userPreferences} onUpdate={handlePreferenceUpdate} />
          </TabsContent>
          <TabsContent value="billing">
            <BillingForm user={user} />
          </TabsContent>
          <TabsContent value="security">
            <SecurityForm user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AccountSettingsPage
