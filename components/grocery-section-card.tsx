"use client"

import React from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ExpandIcon, 
  CollapseIcon, 
  ListIcon 
} from './icons-new'
import { GroceryItemCard } from './grocery-item-card'
import type { GroceryListItem } from "@/hooks/use-grocery-list"

interface GrocerySectionCardProps {
  groupKey: string
  groupTitle: string
  items: GroceryListItem[]
  isCollapsed: boolean
  onToggleSection: (sectionKey: string) => void
  onToggleItem: (itemId: string, checked: boolean) => void
  onDeleteItem: (itemId: string) => void
  t: (key: string) => string
}

export const GrocerySectionCard = ({
  groupKey,
  groupTitle,
  items,
  isCollapsed,
  onToggleSection,
  onToggleItem,
  onDeleteItem,
  t
}: GrocerySectionCardProps) => {
  const pendingItems = items.filter(item => !item.is_checked).length
  const completedItems = items.filter(item => item.is_checked).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div 
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200"
        onClick={() => onToggleSection(groupKey)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ListIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {groupTitle}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                  >
                    {items.length} {items.length !== 1 ? t("groceryList.items") : t("groceryList.item")}
                  </Badge>
                  {completedItems > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    >
                      {completedItems} completados
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isCollapsed ? "Hacer clic para expandir" : "Hacer clic para colapsar"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {pendingItems} pendientes
              </div>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {isCollapsed ? (
                <ExpandIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <CollapseIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <GroceryItemCard
                  key={item.id}
                  item={item}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isCollapsed && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                {pendingItems} items pendientes
                {completedItems > 0 && (
                  <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                    • {completedItems} completados
                  </span>
                )}
              </span>
            </div>
            <span className="text-xs">
              Hacer clic para ver detalles
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
