"use client"

import { User, Settings, CreditCard, LogOut, ChevronRight, Bell, Heart, Gift } from "lucide-react"
import MobileHeader from "@/components/mobile-header"
import MobileNavigation from "@/components/mobile-navigation"

export default function MobileAccountPage() {
  return (
    <div className="bg-cream-50 min-h-screen pb-20">
      <MobileHeader />

      {/* Profile Section */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <User className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Sam Johnson</h2>
            <p className="text-gray-600">sam.johnson@example.com</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="px-4 mt-6">
        <div className="bg-green-600 rounded-lg shadow-sm p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Premium Plan</h3>
            <span className="text-sm bg-white text-green-600 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-sm mb-4">Your subscription renews on June 21, 2025</p>
          <button className="bg-white text-green-600 rounded-lg py-2 px-4 text-sm font-medium">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-600 mr-3" />
              <span>Notifications</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-gray-600 mr-3" />
              <span>Favorite Recipes</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="h-5 w-5 text-gray-600 mr-3" />
              <span>Refer a Friend</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <span>Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
              <span>Payment Methods</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="p-4 flex items-center">
            <LogOut className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-500">Log Out</span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="px-4 mt-6 pb-20">
        <div className="text-center">
          <p className="text-sm text-gray-500">NutriMate v2.0.1</p>
          <p className="text-xs text-gray-400 mt-1">© 2025 NutriMate, Inc.</p>
        </div>
      </div>

      <MobileNavigation />
    </div>
  )
}
