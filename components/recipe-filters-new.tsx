"use client"

import React from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select"
import { 
  SearchIcon, 
  FilterIcon, 
  XIcon 
} from './icons-new'

interface RecipeFiltersNewProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  selectedTags: string[]
  toggleTag: (tag: string) => void
  allTags: string[]
  maxCookTime: number[]
  setMaxCookTime: (time: number[]) => void
  calorieRange: number[]
  setCalorieRange: (range: number[]) => void
  sortOption: "az" | "za" | "calories-asc" | "calories-desc"
  setSortOption: (option: "az" | "za" | "calories-asc" | "calories-desc") => void
  clearFilters: () => void
  activeFiltersCount: number
  t: (key: string) => string
}

export const RecipeFiltersNew = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  selectedTags,
  toggleTag,
  allTags,
  maxCookTime,
  setMaxCookTime,
  calorieRange,
  setCalorieRange,
  sortOption,
  setSortOption,
  clearFilters,
  activeFiltersCount,
  t
}: RecipeFiltersNewProps) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder={t("recipes.search")}
            className="pl-12 pr-4 py-3 w-full transition-all duration-200 focus:ring-2 focus:ring-pastel-orange-500 border-gray-300 dark:border-gray-600 rounded-xl text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 relative transition-all duration-200 hover:bg-pastel-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600 rounded-xl px-6 py-3"
        >
          <FilterIcon className="h-5 w-5" />
          {t("recipes.filter")}
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-pastel-orange-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 space-y-6 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Filtros Avanzados</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {t("recipes.clearAll")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Ordenar recetas
              </label>
              <Select value={sortOption} onValueChange={(v: "az" | "za" | "calories-asc" | "calories-desc") => setSortOption(v)}> 
                <SelectTrigger className="min-w-[200px] w-[250px] h-12 text-sm px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600">
                  {sortOption === "az" && "De A a la Z"}
                  {sortOption === "za" && "De Z a la A"}
                  {sortOption === "calories-asc" && t("recipes.sortCaloriesAsc")}
                  {sortOption === "calories-desc" && t("recipes.sortCaloriesDesc")}
                </SelectTrigger>
                <SelectContent className="min-w-[200px] w-[250px] text-sm rounded-xl">
                  <SelectItem value="az">De A a la Z</SelectItem>
                  <SelectItem value="za">De Z a la A</SelectItem>
                  <SelectItem value="calories-asc">Calorías: menor a mayor</SelectItem>
                  <SelectItem value="calories-desc">Calorías: mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Preferencias Dietéticas y Tags
                </label>
                <div className="flex flex-wrap gap-3">
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className={`text-sm px-4 py-2 h-auto rounded-full transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? "bg-orange-600 text-white hover:bg-orange-700 shadow-md"
                          : "border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-300 dark:hover:border-orange-600"
                      }`}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Tiempo de cocción */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Tiempo máximo de cocción: {maxCookTime[0]} minutos
              </label>
              <div className="px-4">
                <Slider
                  value={maxCookTime}
                  onValueChange={setMaxCookTime}
                  max={300}
                  min={15}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>15 min</span>
                  <span>300 min</span>
                </div>
              </div>
            </div>

            {/* Rango calórico */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Rango calórico: {calorieRange[0]} - {calorieRange[1]} kcal
              </label>
              <div className="px-4">
                <Slider
                  value={calorieRange}
                  onValueChange={setCalorieRange}
                  max={2000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0 kcal</span>
                  <span>2000 kcal</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
