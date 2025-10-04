"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { CustomIngredientsPreview } from "@/components/premium-preview";
import { useIsPremium } from "@/components/auth/user-profile-provider";
import { motion } from "framer-motion";
import { 
  SearchIcon, 
  PlusIcon, 
  MoreIcon, 
  FruitsVegetablesIcon, 
  ProteinsIcon, 
  CarbsIcon, 
  FatsIcon, 
  OthersIcon 
} from "@/components/icons-new";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { IngredientsSkeleton } from "@/components/loading-skeleton";
import { Pagination, usePagination } from "@/components/ui/pagination";

interface Ingredient {
  id: string;
  name: string;
  group: 'carb' | 'protein' | 'fat' | 'vegfruit' | 'treat';
  kcalPer100g: number;
  locale?: string;
}

export default function IngredientsPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isPremium = useIsPremium();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  
  // Paginación
  const ITEMS_PER_PAGE = 12;
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedIngredients,
    goToPage
  } = usePagination(ingredients, ITEMS_PER_PAGE);

  // Form state for adding new ingredient
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    group: 'carb' as 'carb' | 'protein' | 'fat' | 'vegfruit' | 'treat',
    kcalPer100g: 0
  });

  // Fetch ingredients
  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
      } else {
        toast({
          title: t("common.error"),
          description: t("ingredients.errorLoading"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: t("common.error"),
        description: t("ingredients.connectionError"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new ingredient
  const addIngredient = async () => {
    if (!newIngredient.name || newIngredient.kcalPer100g <= 0) {
      toast({
        title: t("common.error"),
        description: t("ingredients.completeFields"),
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/custom-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newIngredient.name,
          nutrition_data: {
            kcalPer100g: newIngredient.kcalPer100g,
            group: newIngredient.group
          }
        })
      });

      if (response.ok) {
        toast({
          title: t("ingredients.ingredientAdded"),
          description: t("ingredients.ingredientAddedDesc", { name: newIngredient.name })
        });
        fetchIngredients(); // Refresh list
        setNewIngredient({ name: '', group: 'carb', kcalPer100g: 0 });
        setShowAddForm(false);
      } else {
        const data = await response.json();
        toast({
          title: t("common.error"),
          description: data.error || t("ingredients.errorAdding"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("ingredients.connectionErrorAdding"),
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'carb': return <CarbsIcon className="w-4 h-4" />;
      case 'protein': return <ProteinsIcon className="w-4 h-4" />;
      case 'fat': return <FatsIcon className="w-4 h-4" />;
      case 'vegfruit': return <FruitsVegetablesIcon className="w-4 h-4" />;
      case 'treat': return <OthersIcon className="w-4 h-4" />;
      default: return <OthersIcon className="w-4 h-4" />;
    }
  };

  const getGroupLabel = (group: string) => {
    return t(`ingredients.groups.${group}`) || group;
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'carb': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'protein': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'fat': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'vegfruit': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'treat': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filter ingredients
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || ingredient.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Aplicar paginación a los ingredientes filtrados
  const {
    currentPage: filteredCurrentPage,
    totalPages: filteredTotalPages,
    paginatedItems: paginatedFilteredIngredients,
    goToPage: goToFilteredPage
  } = usePagination(filteredIngredients, ITEMS_PER_PAGE);

  // Calculate group statistics
  const groupStats = [
    { name: 'Fruits/Vegetables', color: '#22c55e', icon: '🥬', count: ingredients.filter(i => i.group === 'vegfruit').length },
    { name: 'Proteins', color: '#ef4444', icon: '🥩', count: ingredients.filter(i => i.group === 'protein').length },
    { name: 'Carbs', color: '#f59e0b', icon: '🌾', count: ingredients.filter(i => i.group === 'carb').length },
    { name: 'Fats', color: '#8b5cf6', icon: '🥑', count: ingredients.filter(i => i.group === 'fat').length },
    { name: 'Others', color: '#6b7280', icon: '🧂', count: ingredients.filter(i => i.group === 'treat').length }
  ].map(group => ({
    ...group,
    percentage: ingredients.length > 0 ? Math.round((group.count / ingredients.length) * 100) : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <IngredientsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            {t("ingredients.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("ingredients.subtitle")}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Ingredients</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{ingredients.length}</span>
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-2 py-1">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-xl">🥘</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Most Used Group</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Fruits/Vegetables</span>
                    <span className="text-xl">🥬</span>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1">
                  {groupStats.find(g => g.name === 'Fruits/Vegetables')?.count || 0} items
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recently Added</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">5</span>
                    <span className="text-sm text-gray-500">this week</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <span className="text-xl">📈</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Food Groups</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{groupStats.length}</span>
                    <span className="text-sm text-gray-500">categories</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-xl">🏷️</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xl text-gray-900">Ingredients Database</CardTitle>
                    {isPremium ? (
                      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Ingredient
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Ingredient</DialogTitle>
                          <DialogDescription>
                            Add a new ingredient to your database with nutritional information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Ingredient Name</Label>
                              <Input
                                id="name"
                                value={newIngredient.name}
                                onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                                placeholder="e.g., Broccoli"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="group">Food Group</Label>
                              <Select 
                                value={newIngredient.group} 
                                onValueChange={(value: any) => setNewIngredient({...newIngredient, group: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="carb">🌾 Carbs</SelectItem>
                                  <SelectItem value="protein">🥩 Proteins</SelectItem>
                                  <SelectItem value="fat">🥑 Fats</SelectItem>
                                  <SelectItem value="vegfruit">🥬 Fruits/Vegetables</SelectItem>
                                  <SelectItem value="treat">🧂 Others</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="calories">Calories (per 100g)</Label>
                            <Input
                              id="calories"
                              type="number"
                              value={newIngredient.kcalPer100g}
                              onChange={(e) => setNewIngredient({...newIngredient, kcalPer100g: Number(e.target.value)})}
                              placeholder="e.g., 25"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddForm(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={addIngredient}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                          >
                            Add Ingredient
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    ) : (
                      <CustomIngredientsPreview
                        ctaText={t("premiumPreview.customIngredients.cta")}
                      >
                        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30">
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Ingredient
                        </Button>
                      </CustomIngredientsPreview>
                    )}
                  </div>
                  
                  {/* Filters */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search ingredients"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Groups</SelectItem>
                          <SelectItem value="vegfruit">🥬 Fruits/Vegetables</SelectItem>
                          <SelectItem value="protein">🥩 Proteins</SelectItem>
                          <SelectItem value="carb">🌾 Carbs</SelectItem>
                          <SelectItem value="fat">🥑 Fats</SelectItem>
                          <SelectItem value="treat">🧂 Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Ingredients Grid */}
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">{t("ingredients.loadingIngredients")}</p>
                    </div>
                  ) : paginatedFilteredIngredients.length === 0 ? (
                    <div className="text-center py-8">
                      <FruitsVegetablesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchQuery || selectedGroup !== 'all' 
                          ? t("ingredients.noIngredientsFound")
                          : t("ingredients.noIngredientsInDatabase")
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedFilteredIngredients.map((ingredient) => (
                        <Card key={ingredient.id} className="border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <ImageWithFallback
                                src={`https://via.placeholder.com/60x60?text=${ingredient.name.charAt(0)}`}
                                alt={ingredient.name}
                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-medium text-sm text-gray-900">{ingredient.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">Fresh {ingredient.name.toLowerCase()}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-orange-50">
                                    <MoreIcon className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Badge 
                                  className={`text-xs px-2 py-1 mb-3 ${getGroupColor(ingredient.group)}`}
                                >
                                  {getGroupLabel(ingredient.group)}
                                </Badge>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Cal:</span>
                                    <div className="font-medium">{ingredient.kcalPer100g} kcal</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Group:</span>
                                    <div className="font-medium">{getGroupLabel(ingredient.group)}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Per 100g</span>
                                    <div className="font-medium">Nutrition</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {filteredTotalPages > 1 && (
                    <div className="mt-6 pt-4 border-t">
                      <Pagination
                        currentPage={filteredCurrentPage}
                        totalPages={filteredTotalPages}
                        onPageChange={goToFilteredPage}
                        totalItems={filteredIngredients.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        showInfo={true}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Food Groups Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900">Food Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupStats.map((group, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{group.icon}</span>
                        <span className="text-sm font-medium">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{group.count}</span>
                        <span className="text-xs text-gray-500">{group.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: group.color,
                          width: `${group.percentage}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
