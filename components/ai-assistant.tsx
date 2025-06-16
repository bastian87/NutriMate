"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, ChefHatIcon as Chef, Sparkles } from "lucide-react"

interface UserProfile {
  dietaryRestrictions: string[]
  allergies: string[]
  cuisinePreferences: string[]
  cookingSkill: "beginner" | "intermediate" | "advanced"
  cookingTime: string
  servings: number
  healthGoals: string[]
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hi! I'm your AI nutrition assistant. I can help you discover personalized recipes based on your preferences. What would you like to cook today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    cookingSkill: "intermediate",
    cookingTime: "30 minutes",
    servings: 2,
    healthGoals: [],
  })

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          userProfile,
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.success ? data.suggestion : data.error,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = [
    "Suggest a healthy breakfast recipe",
    "I need a quick dinner idea",
    "What's a good vegetarian meal?",
    "Recipe for meal prep",
    "Something with chicken",
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Chef className="h-6 w-6 text-orange-600" />
            AI Recipe Assistant
            <Sparkles className="h-5 w-5 text-orange-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user" ? "bg-orange-600 text-white" : "bg-white border shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">{message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button key={index} variant="outline" size="sm" onClick={() => setInput(prompt)} className="text-xs">
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recipe suggestions..."
              className="flex-1 min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Your Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cooking Skill</label>
              <select
                value={userProfile.cookingSkill}
                onChange={(e) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    cookingSkill: e.target.value as any,
                  }))
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Cooking Time</label>
              <Input
                value={userProfile.cookingTime}
                onChange={(e) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    cookingTime: e.target.value,
                  }))
                }
                placeholder="e.g., 30 minutes"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Servings</label>
              <Input
                type="number"
                value={userProfile.servings}
                onChange={(e) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    servings: Number.parseInt(e.target.value) || 2,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dietary Restrictions</label>
            <div className="flex flex-wrap gap-2">
              {["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Low-Carb", "Dairy-Free"].map((restriction) => (
                <Badge
                  key={restriction}
                  variant={userProfile.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setUserProfile((prev) => ({
                      ...prev,
                      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                        ? prev.dietaryRestrictions.filter((r) => r !== restriction)
                        : [...prev.dietaryRestrictions, restriction],
                    }))
                  }}
                >
                  {restriction}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
