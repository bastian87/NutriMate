"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"
import { useMultipleGroceryLists } from "@/hooks/use-multiple-grocery-lists"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getRecipeById } from "@/lib/services/recipe-service"
import type { GroceryListItem } from "@/hooks/use-grocery-list"
import { FeatureGate } from "@/components/feature-gate"
import { PremiumPreview } from "@/components/premium-preview"
import { motion } from "framer-motion"
import { 
  ArrowLeftIcon, 
  CrownIcon, 
  ShoppingBagIcon,
  SearchIcon,
  MoreIcon,
  PlusIcon,
  PrinterIcon,
  DownloadIcon,
  ExpandIcon,
  CollapseIcon,
  TrashIcon,
  CheckIcon,
  CaloriesIcon,
  WeightIcon,
  WaterIcon
} from '@/components/icons-new'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function GroceryListPage() {
  const { 
    groceryLists, 
    selectedList, 
    selectedListId, 
    setSelectedListId,
    loading, 
    error, 
    createGroceryList,
    deleteGroceryList,
    addItemToList, 
    updateItem, 
    deleteItem, 
    clearAllItems 
  } = useMultipleGroceryLists()
  const { user } = useAuthContext()
  const { userData, loading: profileLoading } = useUserProfile()
  const isPremium = useIsPremium()
  const { t } = useLanguage()
  const { toast } = useToast();
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("")
  const [isClearing, setIsClearing] = useState(false)
  const [recipeNames, setRecipeNames] = useState<Record<string, string>>({});
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('Newest')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    cost: ''
  })

  // Get current list from real data
  const currentList = selectedList ? {
    id: selectedList.id,
    name: selectedList.name || 'Current Grocery List',
    description: selectedList.description || 'Items from your recipes',
    createdDate: new Date(selectedList.created_at).toISOString().split('T')[0],
    itemCount: selectedList.items?.length || 0,
    completedItems: selectedList.items?.filter(item => item.is_checked).length || 0,
    estimatedCost: selectedList.items?.reduce((total, item) => total + (item.estimated_cost || 0), 0) || 0,
    status: (selectedList.items?.length || 0) === 0 ? 'Not Started' : 
            selectedList.items?.every(item => item.is_checked) ? 'Completed' : 'In Progress'
  } : null

  // Generate real data from grocery list
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'fruits': '#42a5f5',
      'vegetables': '#ffa726',
      'protein': '#ff7043',
      'dairy': '#ab47bc',
      'grains': '#98d982',
      'other': '#78909c'
    }
    return colors[category?.toLowerCase()] || '#78909c'
  }

  // Generate category breakdown from real data
  const categoryBreakdown = (selectedList?.items || []).reduce((acc, item) => {
    const category = item.category || 'other'
    if (!acc[category]) {
      acc[category] = { count: 0, totalCost: 0 }
    }
    acc[category].count++
    acc[category].totalCost += item.estimated_cost || 0
    return acc
  }, {} as Record<string, { count: number, totalCost: number }>)

  const categoryData = Object.entries(categoryBreakdown).map(([category, data]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    items: data.count,
    percentage: (selectedList?.items && selectedList.items.length > 0) ? Math.round((data.count / selectedList.items.length) * 100) : 0,
    color: getCategoryColor(category),
    totalCost: data.totalCost
  }))

  // Generate expense breakdown from real data
  const breakdownData = categoryData.map(category => ({
    name: category.name,
    value: category.percentage,
    color: category.color,
    cost: `$${category.totalCost.toFixed(2)}`
  }))

  // Filter items based on search and category
  const filteredItems = (selectedList?.items || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || 
                          (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  // Handle creating new grocery list
  const handleCreateList = async () => {
    if (newListName.trim()) {
      try {
        await createGroceryList(newListName, newListDescription)
        setNewListName('')
        setNewListDescription('')
        setIsCreateDialogOpen(false)
        toast({
          title: "Lista creada",
          description: `La lista "${newListName}" ha sido creada exitosamente.`,
          variant: "default"
        })
      } catch (error) {
        console.error("Error creating list:", error)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        toast({
          title: "Error",
          description: `No se pudo crear la lista: ${errorMessage}`,
          variant: "destructive"
        })
      }
    }
  }

  // Handle adding new item to current list
  const handleAddItemToList = async () => {
    if (newItem.name.trim() && newItem.category && selectedListId) {
      try {
        await addItemToList(selectedListId, {
          name: newItem.name,
          category: newItem.category,
          quantity: newItem.quantity,
          estimatedCost: parseFloat(newItem.cost.replace('$', '')) || 0
        })
        setNewItem({ name: '', category: '', quantity: '', cost: '' })
        setIsAddItemDialogOpen(false)
        toast({
          title: "Item agregado",
          description: `"${newItem.name}" ha sido agregado a la lista.`,
          variant: "default"
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo agregar el item. Inténtalo de nuevo.",
          variant: "destructive"
        })
      }
    }
  }

  // Handle deleting a grocery list
  const handleDeleteList = async (listId: string) => {
    try {
      await deleteGroceryList(listId)
      toast({
        title: "Lista eliminada",
        description: "La lista ha sido eliminada exitosamente.",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la lista. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || !selectedListId) return

    try {
      await addItemToList(selectedListId, {
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
    if (!selectedList?.items?.length || !selectedListId) return;
    setShowClearConfirmDialog(true);
  }

  const confirmClearAll = async () => {
    if (!selectedListId) return;
    setIsClearing(true);
    try {
      await clearAllItems(selectedListId);
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

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey)
      } else {
        newSet.add(sectionKey)
      }
      return newSet
    })
  }

  const isSectionCollapsed = (sectionKey: string) => collapsedSections.has(sectionKey)

  const collapseAllSections = () => {
    setCollapsedSections(new Set(groupKeys))
  }

  const expandAllSections = () => {
    setCollapsedSections(new Set())
  }

  // Handler para imprimir
  const handlePrint = () => {
    if (!selectedList) return;
    
    const items = selectedList.items || [];
    const listName = selectedList.name || 'grocery-list';
    
    // Crear contenido HTML optimizado para impresión
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${listName} - Impresión</title>
          <style>
            @media print {
              @page { margin: 0.5in; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0;
                color: #000;
                background: white;
              }
              .no-print { display: none !important; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #333;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #10B981;
              padding-bottom: 15px;
            }
            .list-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #2d3748; 
              margin: 0;
            }
            .list-description { 
              color: #718096; 
              margin-top: 8px; 
              font-size: 16px;
            }
            .summary {
              background-color: #f7fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .summary-label {
              font-weight: 600;
            }
            .items-list { 
              margin-top: 20px; 
            }
            .item { 
              padding: 12px 0; 
              border-bottom: 1px solid #e2e8f0; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .item:last-child {
              border-bottom: none;
            }
            .item-name { 
              font-weight: 600; 
              font-size: 16px;
              flex: 1;
            }
            .item-details { 
              color: #718096; 
              font-size: 14px; 
              text-align: right;
              min-width: 200px;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #718096; 
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #10B981;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            }
            .print-button:hover {
              background: #059669;
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir Lista</button>
          
          <div class="header">
            <div class="list-name">${listName}</div>
            ${selectedList.description ? `<div class="list-description">${selectedList.description}</div>` : ''}
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <span class="summary-label">Total de items:</span>
              <span>${items.length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Items completados:</span>
              <span>${items.filter(item => item.is_checked).length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Costo estimado:</span>
              <span>$${items.reduce((total, item) => total + (item.estimated_cost || 0), 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="items-list">
            ${items.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                  ${item.quantity ? `${item.quantity}` : ''}
                  ${item.estimated_cost ? ` • $${item.estimated_cost.toFixed(2)}` : ''}
                  ${item.category ? ` • ${item.category}` : ''}
                  ${item.is_checked ? ' ✓' : ''}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            Generado el ${new Date().toLocaleDateString('es-ES')} - NutriMate
          </div>
        </body>
      </html>
    `;
    
    // Crear ventana nueva para imprimir
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };


  // Handler para descargar en Word
  const handleDownloadWord = () => {
    if (!selectedList) return;
    
    const items = selectedList.items || [];
    const listName = selectedList.name || 'grocery-list';
    
    // Crear contenido HTML que Word puede abrir directamente
    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ProgId" content="Word.Document">
          <meta name="Generator" content="Microsoft Word 15">
          <meta name="Originator" content="Microsoft Word 15">
          <title>${listName}</title>
          <style>
            body { 
              font-family: 'Calibri', Arial, sans-serif; 
              margin: 1in; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #10B981;
              padding-bottom: 15px;
            }
            .list-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2d3748; 
              margin: 0;
            }
            .list-description { 
              color: #666; 
              margin-top: 8px; 
              font-size: 14px;
            }
            .summary {
              background-color: #f8f9fa;
              padding: 15px;
              border: 1px solid #dee2e6;
              margin-bottom: 20px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .summary-label {
              font-weight: bold;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .items-table th {
              background-color: #10B981;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            .items-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #ddd;
            }
            .items-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="list-name">${listName}</div>
            ${selectedList.description ? `<div class="list-description">${selectedList.description}</div>` : ''}
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <span class="summary-label">Total de items:</span>
              <span>${items.length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Items completados:</span>
              <span>${items.filter(item => item.is_checked).length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Costo estimado:</span>
              <span>$${items.reduce((total, item) => total + (item.estimated_cost || 0), 0).toFixed(2)}</span>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Costo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category || 'Otro'}</td>
                  <td>${item.quantity || '-'}</td>
                  <td>${item.estimated_cost ? `$${item.estimated_cost.toFixed(2)}` : '-'}</td>
                  <td>${item.is_checked ? 'Completado ✓' : 'Pendiente'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Generado el ${new Date().toLocaleDateString('es-ES')} - NutriMate
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listName.toLowerCase().replace(/\s+/g, '-')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler para compartir en WhatsApp
  const handleShareWhatsApp = () => {
    if (!selectedList) return;
    
    const items = selectedList.items || [];
    const listName = selectedList.name || 'Lista de Compras';
    
    const text = `🛒 *${listName}*\n\n` +
      items.map((item, index) => 
        `${index + 1}. ${item.name}${item.quantity ? ` (${item.quantity})` : ''}`
      ).join('\n') +
      `\n\n📱 Generado con NutriMate`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handler para compartir en redes sociales
  const handleShareSocial = (platform: 'facebook' | 'twitter') => {
    if (!selectedList) return;
    
    const listName = selectedList.name || 'Lista de Compras';
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Mira mi lista de compras: ${listName} - Generada con NutriMate`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  useEffect(() => {
    // Obtener los nombres de las recetas para los ítems con recipe_id
    const fetchRecipeNames = async () => {
      if (!selectedList?.items) return;
      const uniqueRecipeIds = Array.from(new Set(
        selectedList.items.map(item => item.recipe_id).filter(Boolean)
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
  }, [selectedList?.items]);

  // Agrupar ítems por receta_id (o 'other' si no tiene)
  const groupedByRecipe = (selectedList?.items || []).reduce(
    (acc, item) => {
      const key = item.recipe_id || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, any[]>
  );
  const groupKeys = Object.keys(groupedByRecipe);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg"
        >
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("groceryList.pleaseSignIn")}
          </h2>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              {t("groceryList.signIn")}
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // Mostrar información de cuenta inmediatamente si no es premium
  if (!profileLoading && !isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 font-medium">
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              {t("groceryList.backToDashboard")}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <CrownIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Smart Grocery Lists
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
              Upgrade to Premium to unlock advanced grocery list features like 
              export/share functionality and enhanced categorization.
            </p>
            <div className="space-y-4">
              <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/pricing">
                  <CrownIcon className="h-5 w-5 mr-2" />
                  Upgrade to Premium
                </Link>
              </Button>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Free users can still create basic grocery lists manually
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t("groceryList.loading")}</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg"
        >
          <p className="text-red-600 dark:text-red-400 mb-6 text-lg">{t("groceryList.errorLoading")} {error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {t("groceryList.tryAgain")}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <FeatureGate feature="grocery_lists">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 font-medium"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                {t("groceryList.backToDashboard")}
              </Link>
              </div>
              <div className="flex items-center gap-2">
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-md">
                    <CrownIcon className="h-3 w-3 mr-1" />
                    Premium Feature
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Grocery Lists Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Grocery Lists</h1>
              <div className="flex items-center gap-2">
                <Select value={selectedListId} onValueChange={setSelectedListId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    {groceryLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{list.name}</div>
                            <div className="text-xs text-gray-500">
                              {list.items?.length || 0} items • ${list.items?.reduce((total, item) => total + (item.estimated_cost || 0), 0).toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>List Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit List</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate List</DropdownMenuItem>
                    <DropdownMenuItem>Export List</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteList(selectedListId)}
                      disabled={groceryLists.length <= 1}
                    >
                      Delete List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    + Create New List
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Grocery List</DialogTitle>
                    <DialogDescription>
                      Create a custom grocery list with your own name and description.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="listName">List Name</Label>
                      <Input
                        id="listName"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="e.g., Weekend BBQ, Healthy Snacks"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="listDescription">Description (Optional)</Label>
                      <Input
                        id="listDescription"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        placeholder="Brief description of this grocery list"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateList}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={!newListName.trim()}
                    >
                      Create List
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Download and Share Dropdown */}
              {isPremium ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <DownloadIcon className="w-4 h-4" />
                      Export & Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Download</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleDownloadWord}>
                      📝 Download as Word
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint}>
                      🖨️ Print List
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Share</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleShareWhatsApp}>
                      💬 Share on WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareSocial('facebook')}>
                      📘 Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareSocial('twitter')}>
                      🐦 Share on Twitter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <PremiumPreview
                  feature="exports"
                  title={t("premiumPreview.exports.title")}
                  description={t("premiumPreview.exports.description")}
                  ctaText={t("premiumPreview.exports.cta")}
                >
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    Export & Share
                  </Button>
                </PremiumPreview>
              )}
            </div>
          </div>

          {/* Current List Info */}
          {currentList ? (
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{currentList.name}</h2>
                    <p className="text-green-100 text-sm mb-2">{currentList.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Created: {new Date(currentList.createdDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{currentList.itemCount} items</span>
                      <span>•</span>
                      <span className="font-medium">${currentList.estimatedCost.toFixed(2)} estimated</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">
                      {currentList.itemCount > 0 ? Math.round((currentList.completedItems / currentList.itemCount) * 100) : 0}%
                    </div>
                    <div className="text-green-100 text-sm">Complete</div>
                    <Badge 
                      className={`mt-2 text-xs px-2 py-1 ${
                        currentList.status === 'Not Started' ? 'bg-gray-200 text-gray-700' :
                        currentList.status === 'In Progress' ? 'bg-blue-200 text-blue-700' :
                        'bg-yellow-200 text-yellow-700'
                      }`}
                    >
                      {currentList.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">No Grocery List Yet</h2>
                    <p className="text-gray-100 text-sm mb-2">Start by adding items from your recipes or manually</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>0 items</span>
                      <span>•</span>
                      <span className="font-medium">$0.00 estimated</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button 
                      onClick={() => setIsAddItemDialogOpen(true)}
                      className="bg-white text-gray-600 hover:bg-gray-100"
                    >
                      + Add Items
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">
                        ${currentList?.estimatedCost.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Items</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">{currentList?.itemCount || 0}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🛒</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Completed Items</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">{currentList?.completedItems || 0}</span>
                      <span className="text-sm text-gray-500">
                        of {currentList?.itemCount || 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Expense Breakdown */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {breakdownData.length > 0 ? (
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <div className="w-32 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={breakdownData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {breakdownData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-semibold">
                              ${currentList?.estimatedCost.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-500">Total Expenses</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        {breakdownData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium">{item.cost}</span>
                              <span className="text-sm text-gray-500 w-8">{item.value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-gray-500">No data available</p>
                      <p className="text-sm text-gray-400">Add items to see expense breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Grocery Category */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Grocery Category</CardTitle>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{currentList?.itemCount || 0}</div>
                  <div className="text-sm text-gray-500">Items</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryData.length > 0 ? (
                  categoryData.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{category.items} Items</span>
                          <span className="text-sm font-medium">{category.percentage}%</span>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">📦</span>
                    </div>
                    <p className="text-gray-500 text-sm">No categories yet</p>
                    <p className="text-xs text-gray-400">Add items to see categories</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Grocery List Table */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg">
                  {currentList?.name || 'Grocery List'} - Items
                </CardTitle>
                <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                      + Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Item to Grocery List</DialogTitle>
                      <DialogDescription>
                        Add a new item to your grocery list with details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="itemName">Item Name</Label>
                          <Input
                            id="itemName"
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            placeholder="e.g., Banana, Milk"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="itemCategory">Category</Label>
                          <Select 
                            value={newItem.category} 
                            onValueChange={(value) => setNewItem({...newItem, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fruits">🍎 Fruits</SelectItem>
                              <SelectItem value="vegetables">🥬 Vegetables</SelectItem>
                              <SelectItem value="protein">🥩 Protein</SelectItem>
                              <SelectItem value="dairy">🥛 Dairy</SelectItem>
                              <SelectItem value="grains">🌾 Grains</SelectItem>
                              <SelectItem value="other">📦 Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="itemQuantity">Quantity</Label>
                          <Input
                            id="itemQuantity"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                            placeholder="e.g., 2 kg, 1 bottle"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="itemCost">Estimated Cost</Label>
                          <Input
                            id="itemCost"
                            value={newItem.cost}
                            onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                            placeholder="e.g., $5.99"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddItemToList}
                        className="bg-green-500 hover:bg-green-600"
                        disabled={!newItem.name || !newItem.category}
                      >
                        Add Item
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-2">
                  {['All Categories', 'Fruits', 'Vegetables', 'Protein', 'Dairy', 'Grains', 'Other'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search Item"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Newest">Newest</SelectItem>
                      <SelectItem value="Name">Name</SelectItem>
                      <SelectItem value="Price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {filteredItems.length > 0 ? (
                <>
                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-4 pb-3 mb-4 border-b text-sm font-medium text-gray-500">
                    <div>Item Name</div>
                    <div>Category</div>
                    <div>Quantity</div>
                    <div>Cost</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-6 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">{item.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div>
                          <Badge 
                            className="text-xs px-2 py-1"
                            style={{ 
                              backgroundColor: getCategoryColor(item.category || 'other') + '20',
                              color: getCategoryColor(item.category || 'other'),
                              border: `1px solid ${getCategoryColor(item.category || 'other')}`
                            }}
                          >
                            {item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Other'}
                          </Badge>
                        </div>
                        <div className="text-sm">{item.quantity || '-'}</div>
                        <div className="text-sm font-medium">
                          ${item.estimated_cost?.toFixed(2) || '0.00'}
                        </div>
                        <div>
                          <Badge 
                            className={`text-xs px-2 py-1 ${
                              item.is_checked 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.is_checked ? 'Purchased' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleItem(item.id, !item.is_checked)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">No items in your grocery list</p>
                  <p className="text-sm text-gray-400 mb-4">Add items from your recipes or manually</p>
                  <Button 
                    onClick={() => setIsAddItemDialogOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    + Add First Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Grocery Lists Overview */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">My Grocery Lists</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                  {groceryLists.length} Lists
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {groceryLists.map((list) => (
                  <Card 
                    key={list.id} 
                    className={`border-2 cursor-pointer transition-all hover:shadow-md ${
                      list.id === selectedListId ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedListId(list.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm truncate">{list.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{list.description || 'No description'}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Items:</span>
                          <span className="font-medium">{list.items?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Cost:</span>
                          <span className="font-medium">
                            ${list.items?.reduce((total, item) => total + (item.estimated_cost || 0), 0).toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium">
                            {list.items && list.items.length > 0 
                              ? Math.round((list.items.filter(item => item.is_checked).length / list.items.length) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <Progress 
                            value={list.items && list.items.length > 0 
                              ? (list.items.filter(item => item.is_checked).length / list.items.length) * 100 
                              : 0} 
                            className="h-1"
                          />
                        </div>
                        <Badge 
                          className={`text-xs px-2 py-1 w-full justify-center mt-2 ${
                            (list.items?.length || 0) === 0 ? 'bg-gray-100 text-gray-700' :
                            list.items?.every(item => item.is_checked) ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {(list.items?.length || 0) === 0 ? 'Not Started' :
                           list.items?.every(item => item.is_checked) ? 'Completed' :
                           'In Progress'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

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
    </FeatureGate>
  )
}
