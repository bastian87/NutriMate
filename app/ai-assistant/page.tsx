"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, User, AlertCircle, RefreshCw, CheckCircle, ChefHat } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import UpgradePrompt from "@/components/upgrade-prompt"
import UsageTracker from "@/components/usage-tracker"

// Mock user profile
const mockUserProfile = {
  dietaryPreferences: "Vegetarian",
  allergies: "Nuts",
  cookingSkill: "Intermediate",
  availableTime: "45 minutes",
  cuisinePreferences: "Mediterranean, Asian",
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistant() {
  const userId = "user1" // In real app, get from auth
  const { subscription, usage, isPremium, useFeature } = useSubscription(userId)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "success" | "error">("unknown")
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [canUseSuggestions, setCanUseSuggestions] = useState(false)

  useEffect(() => {
    useFeature("ai_suggestions").then(setCanUseSuggestions)
  }, [useFeature])

  const suggestions = [
    "What's a quick vegetarian dinner for tonight?",
    "Suggest a healthy breakfast recipe",
    "I have tomatoes and pasta, what can I make?",
    "Show me a Mediterranean lunch idea",
    "I need a high-protein meal",
    "What's a good beginner-friendly recipe?",
  ]

  const testConnection = useCallback(async () => {
    try {
      setError(null)
      setConnectionStatus("unknown")

      console.log("Testing recipe service...")

      const response = await fetch("/api/test-ai", {
        method: "GET",
      })

      console.log("Test response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Test failed:", errorData)
        setError(`Service Error: ${errorData.error || response.statusText}`)
        setConnectionStatus("error")
        return
      }

      const data = await response.json()
      console.log("Test response data:", data)

      if (data.success) {
        setConnectionStatus("success")
        setError("Recipe service is working perfectly!")
      } else {
        setConnectionStatus("error")
        setError("Recipe service test failed")
      }

      setTimeout(() => setError(null), 3000)
    } catch (error) {
      console.error("Connection test error:", error)
      setError(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setConnectionStatus("error")
    }
  }, [])

  const sendMessage = useCallback(
    async (messageContent: string) => {
      if (!messageContent.trim() || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      setError(null)

      try {
        console.log("Sending message:", messageContent)

        const response = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userProfile: mockUserProfile,
          }),
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log("Recipe service response:", data)

        const assistantContent = data?.choices?.[0]?.message?.content

        if (!assistantContent?.trim()) {
          throw new Error("No response content received from recipe service")
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error("Send message error:", error)
        setError(error instanceof Error ? error.message : "Failed to send message")
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!canUseSuggestions) {
      setShowUpgradePrompt(true)
      return
    }
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (!canUseSuggestions) {
      setShowUpgradePrompt(true)
      return
    }
    sendMessage(suggestion)
  }

  // Show upgrade prompt if user hit limits
  if (showUpgradePrompt && !isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <UpgradePrompt
            feature="ai_suggestions"
            title="You've reached your daily limit"
            description="Free users get 3 recipe suggestions per day. Upgrade to Premium for unlimited access!"
            onDismiss={() => setShowUpgradePrompt(false)}
            variant="card"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="h-8 w-8 text-orange-500" />
            <h1 className="text-4xl font-serif font-bold text-gray-900">Recipe Assistant</h1>
          </div>
          <p className="text-gray-600 text-lg">Get personalized recipe suggestions based on your preferences</p>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ✨ No external AI required - Built-in recipe database
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Usage Tracker */}
            <UsageTracker userId={userId} />

            {/* Connection Status */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-gray-900 flex items-center gap-2">
                  Service Status
                  {connectionStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {connectionStatus === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {connectionStatus === "unknown" && "Service not tested"}
                      {connectionStatus === "success" && "Recipe service is working correctly"}
                      {connectionStatus === "error" && "Recipe service connection failed"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Profile Summary */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-gray-900">Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {mockUserProfile.dietaryPreferences}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    No {mockUserProfile.allergies}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {mockUserProfile.cookingSkill}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {mockUserProfile.availableTime}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {/* Error Display */}
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Notice</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat Interface */}
            <Card className="border-orange-200">
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <ChefHat className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Hi! I'm your recipe assistant</h3>
                      <p className="text-gray-600 mb-4">Ask me for recipe suggestions, cooking tips, or meal ideas!</p>

                      {/* Usage Info for Free Users */}
                      {!isPremium && usage && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 max-w-md mx-auto">
                          <p className="text-sm text-orange-800">
                            You have {usage.aiSuggestions.limit - usage.aiSuggestions.used} recipe suggestions remaining
                            today
                          </p>
                        </div>
                      )}

                      {/* Quick Suggestions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                        {suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="text-left h-auto p-3 border-orange-200 hover:bg-orange-50"
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={isLoading}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <ChefHat className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-orange-500 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <ChefHat className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask for recipe suggestions, cooking tips, or meal ideas..."
                      className="flex-1 border-orange-200 focus:border-orange-500"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>💡 Try asking: "What can I cook with chicken and vegetables?" or "Suggest a healthy dessert"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
