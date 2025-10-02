"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from './icons-new'

interface GroceryAddFormProps {
  newItemName: string
  setNewItemName: (name: string) => void
  newItemQuantity: string
  setNewItemQuantity: (quantity: string) => void
  onAddItem: (e: React.FormEvent) => void
  t: (key: string) => string
}

export const GroceryAddForm = ({
  newItemName,
  setNewItemName,
  newItemQuantity,
  setNewItemQuantity,
  onAddItem,
  t
}: GroceryAddFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-orange-800 dark:text-orange-200 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            {t("groceryList.addNewItem")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder={t("groceryList.itemName")}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full h-12 text-base rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder={t("groceryList.quantityOptional")}
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-full h-12 text-base rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!newItemName.trim()}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t("groceryList.add")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
