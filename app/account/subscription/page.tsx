"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, CreditCard, Settings } from "lucide-react"
import Link from "next/link"
import SubscriptionStatus from "@/components/subscription-status"
import UsageTracker from "@/components/usage-tracker"

export default function SubscriptionPage() {
  const userId = "user1" // In real app, get from auth

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-gray-600">Manage your NutriMate subscription and billing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Status */}
          <SubscriptionStatus userId={userId} />

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "2024-01-15", amount: "$4.99", status: "Paid", invoice: "INV-001" },
                  { date: "2023-12-15", amount: "$4.99", status: "Paid", invoice: "INV-002" },
                  { date: "2023-11-15", amount: "$4.99", status: "Paid", invoice: "INV-003" },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{payment.date}</p>
                      <p className="text-sm text-gray-600">Invoice {payment.invoice}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{payment.amount}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Invoices
              </Button>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded p-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Usage Tracker */}
          <UsageTracker userId={userId} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Change Billing Cycle
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Download Invoices
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Have questions about your subscription or billing?</p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
