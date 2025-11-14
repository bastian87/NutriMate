"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  SearchIcon, 
} from './icons-new'

interface RecipeFiltersNewProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  t: (key: string) => string
}

export const RecipeFiltersNew = ({
  searchQuery,
  setSearchQuery,
  t
}: RecipeFiltersNewProps) => {
  return (
    <div className="mb-8">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="search"
          placeholder={t("recipes.search")}
          className="pl-12 pr-4 py-3 w-full transition-all duration-200 focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded-xl text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  )
}
