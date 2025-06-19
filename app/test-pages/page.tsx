"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Settings, CreditCard } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

export default function TestPagesPage() {
  const { t } = useLanguage()

  const desktopPages = [
    { name: t("testPages.home"), path: "/", description: t("testPages.homeDesc") },
    { name: t("testPages.dashboard"), path: "/dashboard", description: t("testPages.dashboardDesc") },
    { name: t("testPages.recipes"), path: "/recipes", description: t("testPages.recipesDesc") },
    {
      name: t("testPages.recipeDetail"),
      path: "/recipes/117a4059-431d-4b8d-bf8c-ff5477b2aabd",
      description: t("testPages.recipeDetailDesc"),
    },
    { name: t("testPages.groceryList"), path: "/grocery-list", description: t("testPages.groceryListDesc") },
    { name: t("testPages.mealPlans"), path: "/meal-plans", description: t("testPages.mealPlansDesc") },
    { name: t("testPages.aiAssistant"), path: "/ai-assistant", description: "Recipe suggestions chat" },
    { name: t("testPages.pricing"), path: "/pricing", description: t("testPages.pricingDesc") },
    { name: t("testPages.checkout"), path: "/checkout", description: t("testPages.checkoutDesc") },
    { name: t("testPages.checkoutSuccess"), path: "/checkout/success", description: t("testPages.checkoutSuccessDesc") },
    { name: t("testPages.onboarding"), path: "/onboarding", description: t("testPages.onboardingDesc") },
    { name: t("testPages.login"), path: "/login", description: t("testPages.loginDesc") },
    { name: t("testPages.signup"), path: "/signup", description: t("testPages.signupDesc") },
    { name: t("testPages.subscription"), path: "/account/subscription", description: t("testPages.subscriptionDesc") },
  ]

  const mobilePages = [
    { name: t("testPages.mobileHome"), path: "/mobile", description: t("testPages.mobileHomeDesc") },
    { name: t("testPages.mobileMealPlans"), path: "/mobile/meal-plans", description: "Mobile meal planning" },
    { name: t("testPages.mobileGroceryList"), path: "/mobile/grocery-list", description: "Mobile shopping lists" },
    { name: t("testPages.mobileAccount"), path: "/mobile/account", description: "Mobile account management" },
    {
      name: "Mobile Recipe",
      path: "/mobile/recipes/grilled-salmon-with-roasted-vegetables",
      description: "Mobile recipe view",
    },
  ]

  const adminPages = [{ name: "Test Users", path: "/admin/test-users", description: "Test user management (dev only)" }]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">NutriMate - All Pages</h1>
        <p className="text-gray-600">Navigate to any page to test functionality and design</p>
        <Badge variant="secondary" className="mt-2">
          Development Testing Tool
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Desktop Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {desktopPages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-orange-600">{page.name}</h3>
                      <p className="text-sm text-gray-600">{page.description}</p>
                      <code className="text-xs text-gray-400">{page.path}</code>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Visit →
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mobilePages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-blue-600">{page.name}</h3>
                      <p className="text-sm text-gray-600">{page.description}</p>
                      <code className="text-xs text-gray-400">{page.path}</code>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Visit →
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Use browser dev tools to simulate mobile view (F12 → Device toolbar)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin/Dev Pages */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin/Development Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminPages.map((page) => (
              <Link
                key={page.path}
                href={page.path}
                className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-purple-600">{page.name}</h3>
                    <p className="text-sm text-gray-600">{page.description}</p>
                    <code className="text-xs text-gray-400">{page.path}</code>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Visit →
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testing Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Testing Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">🔍 What to Check:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Page loads without errors</li>
                <li>• All components render correctly</li>
                <li>• Navigation works properly</li>
                <li>• Forms submit successfully</li>
                <li>• Responsive design on mobile</li>
                <li>• Dark mode toggle (if applicable)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🛠️ Browser Tools:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• F12 - Open developer tools</li>
                <li>• Console tab - Check for errors</li>
                <li>• Network tab - Monitor API calls</li>
                <li>• Device toolbar - Test mobile view</li>
                <li>• Lighthouse - Performance audit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
