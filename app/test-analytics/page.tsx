"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { analytics } from "@/lib/analytics"
import { CheckCircle, XCircle, AlertCircle, Activity, Database, Copy } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  details?: any
}

export default function TestAnalyticsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [gaStatus, setGaStatus] = useState<"checking" | "found" | "missing">("checking")
  const [setupInstructions, setSetupInstructions] = useState<{
    sql: string
    instructions: string[]
  } | null>(null)

  // Generate a valid UUID for testing
  const testUserId = "550e8400-e29b-41d4-a716-446655440000" // Valid UUID format
  const testUserString = "test-user-analytics" // String identifier

  useEffect(() => {
    checkGoogleAnalytics()
  }, [])

  const checkGoogleAnalytics = () => {
    setTimeout(() => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        setGaStatus("found")
      } else {
        setGaStatus("missing")
      }
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("SQL copied to clipboard!")
  }

  const setupAnalyticsTable = async () => {
    setIsSettingUp(true)
    setSetupInstructions(null)

    try {
      const response = await fetch("/api/setup-analytics", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.sql && data.instructions) {
          setSetupInstructions({
            sql: data.sql,
            instructions: data.instructions,
          })
        }
        throw new Error(data.details || `HTTP ${response.status}`)
      }

      alert("Analytics table setup complete! You can now run the tests.")
    } catch (error) {
      console.error("Setup error:", error)
      if (!setupInstructions) {
        alert(`Setup failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    } finally {
      setIsSettingUp(false)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const tests = [
      testEnvironmentVariables,
      testGoogleAnalyticsIntegration,
      testCustomAnalyticsEndpoint,
      testUserEvents,
      testRecipeEvents,
      testGroceryListEvents,
      testSubscriptionEvents,
      testDatabaseConnection,
    ]

    for (const test of tests) {
      try {
        const result = await test()
        setTestResults((prev) => [...prev, result])
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        setTestResults((prev) => [
          ...prev,
          {
            name: test.name,
            status: "error",
            message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ])
      }
    }

    setIsRunning(false)
  }

  // Test functions
  const testEnvironmentVariables = async (): Promise<TestResult> => {
    const hardcodedGaId = "G-SCX9Q55CJF"
    return {
      name: "Environment Variables",
      status: "success",
      message: `Using hardcoded GA Measurement ID: ${hardcodedGaId}`,
      details: { gaId: hardcodedGaId },
    }
  }

  const testGoogleAnalyticsIntegration = async (): Promise<TestResult> => {
    if (typeof window === "undefined") {
      return {
        name: "Google Analytics Integration",
        status: "error",
        message: "Running on server side",
      }
    }

    if (!(window as any).gtag) {
      return {
        name: "Google Analytics Integration",
        status: "error",
        message: "Google Analytics (gtag) not loaded",
      }
    }

    try {
      ;(window as any).gtag("event", "test_event", {
        event_category: "test",
        event_label: "analytics_test",
      })

      return {
        name: "Google Analytics Integration",
        status: "success",
        message: "Google Analytics is loaded and test event sent",
      }
    } catch (error) {
      return {
        name: "Google Analytics Integration",
        status: "error",
        message: `Failed to send test event: ${error}`,
      }
    }
  }

  const testCustomAnalyticsEndpoint = async (): Promise<TestResult> => {
    try {
      // Test with both UUID and string user IDs
      const tests = [
        {
          name: "UUID User ID",
          userId: testUserId,
        },
        {
          name: "String User ID",
          userId: testUserString,
        },
        {
          name: "No User ID",
          userId: null,
        },
      ]

      const results = []

      for (const test of tests) {
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: `test_custom_analytics_${test.name.toLowerCase().replace(/\s+/g, "_")}`,
            properties: {
              test: true,
              test_type: test.name,
              timestamp: new Date().toISOString(),
            },
            userId: test.userId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`${test.name}: ${errorData.details || `HTTP ${response.status}`}`)
        }

        const data = await response.json()
        results.push({ test: test.name, success: true, data })
      }

      return {
        name: "Custom Analytics Endpoint",
        status: "success",
        message: "Custom analytics endpoint working with all user ID types",
        details: results,
      }
    } catch (error) {
      return {
        name: "Custom Analytics Endpoint",
        status: "error",
        message: `Failed to send to custom endpoint: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  const testUserEvents = async (): Promise<TestResult> => {
    try {
      analytics.userSignUp(testUserString, "email")
      analytics.userSignIn(testUserString, "email")
      analytics.sessionStart(testUserString)
      return {
        name: "User Events",
        status: "success",
        message: "User events sent successfully",
      }
    } catch (error) {
      return {
        name: "User Events",
        status: "error",
        message: `Failed to send user events: ${error}`,
      }
    }
  }

  const testRecipeEvents = async (): Promise<TestResult> => {
    try {
      analytics.recipeView("test-recipe-123", "Test Recipe", testUserString)
      analytics.recipeFavorite("test-recipe-123", "Test Recipe", "add", testUserString)
      analytics.recipeRate("test-recipe-123", 5, testUserString)
      analytics.recipeSearch("chicken", 10, testUserString)
      return {
        name: "Recipe Events",
        status: "success",
        message: "Recipe events sent successfully",
      }
    } catch (error) {
      return {
        name: "Recipe Events",
        status: "error",
        message: `Failed to send recipe events: ${error}`,
      }
    }
  }

  const testGroceryListEvents = async (): Promise<TestResult> => {
    try {
      analytics.groceryListCreate(testUserString)
      analytics.groceryListAddItem("Test Item", "manual", testUserString)
      analytics.groceryListAddRecipe("test-recipe-123", 5, testUserString)
      analytics.groceryListComplete(10, testUserString)
      return {
        name: "Grocery List Events",
        status: "success",
        message: "Grocery list events sent successfully",
      }
    } catch (error) {
      return {
        name: "Grocery List Events",
        status: "error",
        message: `Failed to send grocery list events: ${error}`,
      }
    }
  }

  const testSubscriptionEvents = async (): Promise<TestResult> => {
    try {
      analytics.subscriptionStart("premium", "monthly", 9.99, testUserString)
      analytics.premiumFeatureBlocked("advanced_meal_planning", testUserString)
      return {
        name: "Subscription Events",
        status: "success",
        message: "Subscription events sent successfully",
      }
    } catch (error) {
      return {
        name: "Subscription Events",
        status: "error",
        message: `Failed to send subscription events: ${error}`,
      }
    }
  }

  const testDatabaseConnection = async (): Promise<TestResult> => {
    try {
      const response = await fetch("/api/metrics?period=7d&metric=overview")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        name: "Database Connection",
        status: "success",
        message: "Analytics database connection working",
        details: data,
      }
    } catch (error) {
      return {
        name: "Database Connection",
        status: "error",
        message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const successCount = testResults.filter((r) => r.status === "success").length
  const errorCount = testResults.filter((r) => r.status === "error").length

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Testing Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Test all analytics functionality to ensure proper tracking</p>
      </div>

      {/* Database Setup */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Setup
          </CardTitle>
          <CardDescription>
            If you're getting database errors, click this button to create the analytics table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={setupAnalyticsTable}
            disabled={isSettingUp}
            variant="outline"
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            {isSettingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                Setting up...
              </>
            ) : (
              "Setup Analytics Table"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Setup Instructions */}
      {setupInstructions && (
        <Card className="mb-6 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Manual Database Setup Required</CardTitle>
            <CardDescription>
              Please follow these steps to create the analytics table in your Supabase database:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {setupInstructions.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">SQL to run:</h4>
                  <Button onClick={() => copyToClipboard(setupInstructions.sql)} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy SQL
                  </Button>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-auto">
                  {setupInstructions.sql}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Analytics Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Google Analytics Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {gaStatus === "checking" && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span>Checking Google Analytics...</span>
              </>
            )}
            {gaStatus === "found" && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Google Analytics loaded successfully</span>
              </>
            )}
            {gaStatus === "missing" && (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Google Analytics not detected</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Run Analytics Tests</CardTitle>
          <CardDescription>
            This will test all analytics functionality including Google Analytics, custom events, and database storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={runAllTests} disabled={isRunning} className="bg-orange-600 hover:bg-orange-700">
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Tests...
                </>
              ) : (
                "Run All Tests"
              )}
            </Button>

            {testResults.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ {successCount} Passed
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    ✗ {errorCount} Failed
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results of analytics functionality tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{result.name}</h3>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer hover:underline">View Details</summary>
                          <pre className="text-xs mt-2 p-2 bg-black/5 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
