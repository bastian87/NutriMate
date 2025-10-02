"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  CheckIcon, 
  TrashIcon 
} from './icons-new'
import type { GroceryListItem } from "@/hooks/use-grocery-list"

interface GroceryItemCardProps {
  item: GroceryListItem
  onToggle: (itemId: string, checked: boolean) => void
  onDelete: (itemId: string) => void
  index: number
}

export const GroceryItemCard = ({ 
  item, 
  onToggle, 
  onDelete, 
  index 
}: GroceryItemCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${
        item.is_checked ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'hover:border-orange-300 dark:hover:border-orange-600'
      }`}>
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <Checkbox
              checked={item.is_checked}
              onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
              className="w-5 h-5"
            />
            {item.is_checked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className={`flex-1 ${item.is_checked ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </span>
              {item.quantity && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-1 ${
                    item.is_checked 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600' 
                      : 'bg-pastel-orange-50 dark:bg-orange-900/20 text-pastel-orange-700 dark:text-orange-300 border-pastel-orange-200 dark:border-orange-800'
                  }`}
                >
                  {item.quantity} {item.unit}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-pastel-pink-600 hover:text-pastel-pink-700 hover:bg-pastel-pink-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
