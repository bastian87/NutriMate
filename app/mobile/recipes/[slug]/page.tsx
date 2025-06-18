"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Bookmark, Share2, Clock } from "lucide-react"
import { useRecipe } from "@/hooks/use-recipes"
import MobileNavigation from "@/components/mobile-navigation"

export default function MobileRecipePage({ params }: { params: { slug: string } }) {
  const { recipe } = useRecipe(params.slug)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"recipe" | "reviews">("recipe")

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Status Bar */}
      <div className="px-4 py-2 flex justify-between text-xs text-gray-700">
        <div>9:41</div>
        <div className="flex space-x-1">
          <div className="flex items-center">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 4.5C1 2.84315 2.34315 1.5 4 1.5H14C15.6569 1.5 17 2.84315 17 4.5V7.5C17 9.15685 15.6569 10.5 14 10.5H4C2.34315 10.5 1 9.15685 1 7.5V4.5Z"
                stroke="black"
                strokeWidth="1.5"
              />
              <path d="M17.5 5.5V6.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-center">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 2.5C1 1.67157 1.67157 1 2.5 1H13.5C14.3284 1 15 1.67157 15 2.5V9.5C15 10.3284 14.3284 11 13.5 11H2.5C1.67157 11 1 10.3284 1 9.5V2.5Z"
                stroke="black"
                strokeWidth="1.5"
              />
              <path d="M4 3.5L4 8.5M8 5.5L8 8.5M12 3.5L12 8.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-center">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 1.5C11.4853 1.5 13.5 3.51472 13.5 6C13.5 8.48528 11.4853 10.5 9 10.5C6.51472 10.5 4.5 8.48528 4.5 6C4.5 3.51472 6.51472 1.5 9 1.5Z"
                stroke="black"
                strokeWidth="1.5"
              />
              <path
                d="M1.5 6H2.5M15.5 6H16.5M9 1.5V0.5M9 11.5V10.5"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/mobile">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-full px-3 py-1 text-sm">
            <span>135</span>
          </div>
          <button>
            <Share2 className="h-6 w-6" />
          </button>
          <button>
            <Bookmark
              className={`h-6 w-6 ${saved ? "fill-orange-600 text-orange-600" : ""}`}
              onClick={() => setSaved(!saved)}
            />
          </button>
        </div>
      </div>

      {/* Recipe Image */}
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 w-full">
          <Image
            src={recipe.image_url || "/placeholder.svg?height=400&width=600"}
            alt={recipe.name}
            width={600}
            height={400}
            className="object-cover w-full"
          />
        </div>
        <div className="absolute bottom-2 right-2 bg-white rounded-full p-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 3L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="px-4 py-6">
        <h1 className="text-3xl font-serif font-bold">{recipe.name}</h1>

        <div className="mt-2">
          <div className="flex items-center">
            <p className="text-gray-700">
              By <span className="underline">Nutrition Expert</span>
            </p>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <span className="text-lg font-bold">5</span>
          <span className="text-gray-500 ml-1">(2,534)</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">{recipe.prep_time_minutes + recipe.cook_time_minutes} minutes</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-700">{recipe.description}</p>
          <button className="text-orange-600 font-medium mt-2">Read More</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 flex space-x-4 border-t border-b border-gray-200">
        <button className="flex-1 bg-orange-600 text-white py-3 rounded-lg flex items-center justify-center font-medium">
          <Bookmark className="h-5 w-5 mr-2" />
          Save
        </button>
        <button className="flex-1 border border-gray-300 py-3 rounded-lg flex items-center justify-center font-medium">
          Cook
        </button>
        <button className="flex-1 border border-gray-300 py-3 rounded-lg flex items-center justify-center font-medium">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 12L12 12M12 12L4 12M12 12L12 4M12 12L12 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Give
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 border-b border-gray-200">
        <div className="flex">
          <button
            className={`pb-2 px-4 font-medium ${activeTab === "recipe" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("recipe")}
          >
            Recipe
          </button>
          <button
            className={`pb-2 px-4 font-medium ${activeTab === "reviews" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Recipe Content */}
      {activeTab === "recipe" && (
        <div className="px-4 py-6">
          <h2 className="text-xl font-serif font-bold mb-4">Ingredients</h2>
          <ul className="space-y-3 mb-8">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-center">
                <div className="h-5 w-5 rounded-full border border-gray-300 mr-3"></div>
                <span>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-serif font-bold mb-4">Preparation</h2>
          <ol className="space-y-6 mb-8">
            {recipe.instructions.split("\n").map((step, index) => {
              // Remove the leading number if present
              const cleanStep = step.replace(/^\d+\.\s*/, "")

              return (
                <li key={index} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{cleanStep}</p>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full border border-gray-300 mr-2 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12L10 17L20 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-gray-700">Mark as Cooked</span>
            </div>

            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="h-6 w-6 text-gray-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Content */}
      {activeTab === "reviews" && (
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold">Reviews</h2>
            <button className="text-orange-600 font-medium">Write a Review</button>
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((review) => (
              <div key={review} className="pb-6 border-b border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                  <div>
                    <p className="font-medium">User Name</p>
                    <p className="text-sm text-gray-500">2 months ago</p>
                  </div>
                </div>

                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700">
                  This recipe was amazing! I made it for dinner last night and my family loved it. Will definitely make
                  it again.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  )
}
