"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  PrinterIcon, 
  DownloadIcon, 
  ExpandIcon, 
  CollapseIcon, 
  TrashIcon,
  CrownIcon
} from './icons-new'

interface GroceryToolbarProps {
  isPremium: boolean
  itemsCount: number
  onPrint: () => void
  onDownload: () => void
  onCollapseAll: () => void
  onExpandAll: () => void
  onClearAll: () => void
  isClearing: boolean
  t: (key: string) => string
}

export const GroceryToolbar = ({
  isPremium,
  itemsCount,
  onPrint,
  onDownload,
  onCollapseAll,
  onExpandAll,
  onClearAll,
  isClearing,
  t
}: GroceryToolbarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t("groceryList.title")}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {isPremium && (
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-md">
                <CrownIcon className="h-3 w-3 mr-1" />
                Premium Feature
              </Badge>
            )}
            <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
              {itemsCount} {itemsCount !== 1 ? t("groceryList.items") : t("groceryList.item")}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
        >
          <PrinterIcon className="h-4 w-4" />
          {t("groceryList.print")}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
        >
          <DownloadIcon className="h-4 w-4" />
          {t("groceryList.download")}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onCollapseAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
        >
          <CollapseIcon className="h-4 w-4" />
          Colapsar Todo
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onExpandAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
        >
          <ExpandIcon className="h-4 w-4" />
          Expandir Todo
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={onClearAll} 
          disabled={isClearing || itemsCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4" />
          {isClearing ? t("groceryList.deleting") : t("groceryList.clearList")}
        </Button>
      </div>
    </motion.div>
  )
}
