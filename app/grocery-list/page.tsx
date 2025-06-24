"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"
import { useGroceryList } from "@/hooks/use-grocery-list"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRecipeById } from "@/lib/services/recipe-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function GroceryListPage() {
  const { groceryList, loading, error, addItem, updateItem, deleteItem, clearAllItems } = useGroceryList()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast();
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("")
  const [isClearing, setIsClearing] = useState(false)
  const [recipeNames, setRecipeNames] = useState<Record<string, string>>({});
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false)

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    try {
      await addItem({
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
        category: "other",
      })
      setNewItemName("")
      setNewItemQuantity("")
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    try {
      await updateItem(itemId, { is_checked: checked })
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleClearAll = async () => {
    if (!groceryList?.items.length) return;
    setShowClearConfirmDialog(true);
  }

  const confirmClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAllItems();
      toast({
        title: t("groceryList.clearList") + "!",
        description: t("groceryList.noItems"),
        variant: "default"
      });
    } catch (err) {
      toast({
        title: t("groceryList.errorLoading"),
        description: "Failed to clear grocery list.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
      setShowClearConfirmDialog(false);
    }
  }

  // Handler para imprimir
  const handlePrint = () => {
    window.print();
  };

  // Handler para descargar
  const handleDownload = () => {
    const items = groceryList?.items || [];
    const text = items.map(item =>
      `${item.name}${item.quantity ? ` (${item.quantity})` : ""}`
    ).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grocery-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Obtener los nombres de las recetas para los ítems con recipe_id
    const fetchRecipeNames = async () => {
      if (!groceryList?.items) return;
      const uniqueRecipeIds = Array.from(new Set(
        groceryList.items.map(item => item.recipe_id).filter(Boolean)
      ));
      const names: Record<string, string> = {};
      await Promise.all(
        uniqueRecipeIds.map(async (id) => {
          if (!id) return;
          try {
            const recipe = await getRecipeById(id);
            if (recipe) names[id] = recipe.name;
          } catch {}
        })
      );
      setRecipeNames(names);
    };
    fetchRecipeNames();
  }, [groceryList?.items]);

  // Agrupar ítems por receta_id (o 'other' si no tiene)
  const groupedByRecipe = (groceryList?.items || []).reduce(
    (acc, item) => {
      const key = item.recipe_id || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof groceryList.items>
  );
  const groupKeys = Object.keys(groupedByRecipe);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t("groceryList.pleaseSignIn")}</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">{t("groceryList.signIn")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t("groceryList.loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{t("groceryList.errorLoading")} {error}</p>
          <Button onClick={() => window.location.reload()}>{t("groceryList.tryAgain")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-orange-600 hover:text-orange-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("groceryList.backToDashboard")}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">{t("groceryList.title")}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t("groceryList.print")}
          </Button>
          <Button variant="outline" className="flex items-center" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t("groceryList.download")}
          </Button>
          <Button variant="destructive" className="flex items-center" onClick={handleClearAll} disabled={isClearing || !groceryList?.items.length}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t("groceryList.clearList")}
          </Button>
        </div>
      </div>

      {/* Add New Item Form */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg mb-4">{t("groceryList.addNewItem")}</h3>
        <form onSubmit={handleAddItem} className="flex gap-4">
          <Input
            type="text"
            placeholder={t("groceryList.itemName")}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1"
          />
          <Input
            type="text"
            placeholder={t("groceryList.quantityOptional")}
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            className="w-32"
          />
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            {t("groceryList.add")}
          </Button>
        </form>
      </div>

      {/* Grocery List Items */}
      <div className="space-y-8">
        {groupKeys.map((groupKey) => {
          const items = groupedByRecipe[groupKey];
          if (!items || items.length === 0) return null;
          const isOther = groupKey === "other";
          const groupTitle = isOther ? t("groceryList.categories.other") : recipeNames[groupKey] || t("groceryList.loading");
          return (
            <div
              key={groupKey}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Eliminar badge, solo mostrar el nombre */}
                    <span className="font-semibold text-lg">{groupTitle}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {items.length} {items.length !== 1 ? t("groceryList.items") : t("groceryList.item")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={item.is_checked}
                          onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                        />
                        <div className={`flex-1 ${item.is_checked ? "line-through text-gray-500" : ""}`}>
                          <span className="font-medium">{item.name}</span>
                          {item.quantity && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {item.quantity} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!groceryList?.items || groceryList.items.length === 0) && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Your grocery list is empty.</p>
          <p className="text-sm text-gray-400">Add items manually or from recipe pages to get started.</p>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearConfirmDialog} onOpenChange={setShowClearConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("groceryList.clearListConfirm")}</DialogTitle>
            <DialogDescription>
              {t("groceryList.clearListDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirmDialog(false)}
              disabled={isClearing}
            >
              {t("groceryList.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClearAll}
              disabled={isClearing}
            >
              {isClearing ? t("groceryList.deleting") : t("groceryList.deleteAll")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
