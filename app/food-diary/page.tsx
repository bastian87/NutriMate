"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { 
  SearchIcon, 
  PlusIcon, 
  MoreIcon, 
  CaloriesIcon,
  WaterIcon,
  ClockIcon,
  HeartIcon
} from "@/components/icons-new";
import { Edit as EditIcon, Trash2 as TrashIcon } from 'lucide-react';
import { ImageWithFallback } from "@/components/image-with-fallback";
import { Pagination, usePagination } from "@/components/ui/pagination";

interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  type: 'fruits_vegetables' | 'proteins' | 'carbs' | 'fats' | 'others';
}

interface FoodEntry {
  id: string;
  date: string;
  time: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  
  // Modo "Plato completo"
  menu?: string;
  amount?: string;
  carb?: number;
  protein?: number;
  fats?: number;
  sugar?: number;
  calories?: number;
  
  // Modo "Ingredientes"
  ingredients?: Ingredient[];
  
  // Campos comunes
  thoughts: string;
  image_url?: string;
  entry_mode: 'dish' | 'ingredients';
}

interface NutritionMetrics {
  totalCalories: number;
  totalCarbs: number;
  totalProteins: number;
  totalFats: number;
  totalSugar: number;
  waterIntake: number;
  mood: string;
}

export default function FoodDiaryPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('All');
  const [timeFrame, setTimeFrame] = useState('This Week');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [entryMode, setEntryMode] = useState<'dish' | 'ingredients'>('dish');
  
  // Paginación
  const ITEMS_PER_PAGE = 10;
  const [newEntry, setNewEntry] = useState({
    category: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    menu: '',
    amount: '',
    carb: 0,
    protein: 0,
    fats: 0,
    sugar: 0,
    calories: 0,
    thoughts: ''
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState<{[key: string]: string}>({});
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch available ingredients from database
  const fetchIngredients = async () => {
    try {
      console.log('Fetching ingredients...');
      const response = await fetch('/api/ingredients');
      console.log('Ingredients response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Ingredients data:', data);
        
        // Map database groups to our ingredient types
        const mappedIngredients = (data.ingredients || []).map((ingredient: any) => ({
          ...ingredient,
          group: ingredient.group === 'carb' ? 'carbs' : 
                 ingredient.group === 'protein' ? 'proteins' :
                 ingredient.group === 'fat' ? 'fats' :
                 ingredient.group === 'vegfruit' ? 'fruits_vegetables' : 
                 ingredient.group === 'treat' ? 'others' : 'others'
        }));
        
        setAvailableIngredients(mappedIngredients);
      } else {
        console.error('Failed to fetch ingredients:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error data:', errorData);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  // Filter ingredients by type
  const getIngredientsByType = (type: 'fruits_vegetables' | 'proteins' | 'carbs' | 'fats' | 'others') => {
    return availableIngredients.filter(ing => ing.group === type);
  };

  // Handle ingredient search for individual fields
  const handleIngredientSearch = (ingredientId: string, value: string) => {
    setIngredientSearch(prev => ({
      ...prev,
      [ingredientId]: value
    }));
  };

  // Get search value for specific ingredient
  const getIngredientSearch = (ingredientId: string) => {
    return ingredientSearch[ingredientId] || '';
  };

  // Ingredient management functions
  const addIngredient = (type: 'fruits_vegetables' | 'proteins' | 'carbs' | 'fats' | 'others') => {
    const newIngredient = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      unit: 'g',
      calories: 0,
      carbs: 0,
      protein: 0,
      fats: 0,
      type: type
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate macros when selecting from database
    if (field === 'name' && value && availableIngredients.length > 0) {
      const dbIngredient = availableIngredients.find(ing => ing.name === value);
      if (dbIngredient) {
        updated[index] = {
          ...updated[index],
          calories: dbIngredient.calories_per_100g || 0,
          carbs: dbIngredient.carbs_per_100g || 0,
          protein: dbIngredient.protein_per_100g || 0,
          fats: dbIngredient.fats_per_100g || 0
        };
      }
      // Clear search for this ingredient
      if (updated[index].id) {
        handleIngredientSearch(updated[index].id, '');
      }
    }
    
    setIngredients(updated);
  };

  const calculateTotalCalories = () => {
    return ingredients.reduce((total, ingredient) => total + ingredient.calories, 0);
  };

  // Load ingredients when dialog opens or mode changes
  useEffect(() => {
    if (showAddDialog && entryMode === 'ingredients') {
      console.log('Loading ingredients for ingredients mode');
      fetchIngredients();
    }
  }, [showAddDialog, entryMode]);

  // Also load ingredients when switching to ingredients mode
  useEffect(() => {
    if (entryMode === 'ingredients' && availableIngredients.length === 0) {
      console.log('Loading ingredients when switching to ingredients mode');
      fetchIngredients();
    }
  }, [entryMode]);

  // Fetch food entries
  const fetchFoodEntries = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/food-entries', {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFoodEntries(data.entries || []);
      } else {
        toast({
          title: t("common.error"),
          description: t("foodDiary.errorLoadingEntries"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching food entries:', error);
      toast({
        title: t("common.error"),
        description: t("common.connectionError"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new food entry
  const addFoodEntry = async () => {
    if (!user?.id) {
      toast({
        title: t("common.error"),
        description: t("foodDiary.pleaseLogInToAdd"),
        variant: "destructive"
      });
      return;
    }

    // Validation based on entry mode
    if (entryMode === 'dish') {
      if (!newEntry.menu) {
        toast({
          title: t("common.error"),
          description: t("foodDiary.pleaseEnterMenuItem"),
          variant: "destructive"
        });
        return;
      }
    } else {
      if (ingredients.length === 0 || ingredients.some(ing => !ing.name.trim())) {
        toast({
          title: t("common.error"),
          description: t("foodDiary.pleaseAddIngredient"),
          variant: "destructive"
        });
        return;
      }
    }

    try {
      // Prepare data based on entry mode
      const entryData = {
        ...newEntry,
        entry_mode: entryMode,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        ...(entryMode === 'ingredients' && {
          ingredients: ingredients,
          calories: calculateTotalCalories(),
          carb: ingredients.reduce((sum, ing) => sum + ing.carbs, 0),
          protein: ingredients.reduce((sum, ing) => sum + ing.protein, 0),
          fats: ingredients.reduce((sum, ing) => sum + ing.fats, 0),
          menu: ingredients.map(ing => ing.name).join(', '),
          amount: `${ingredients.length} ingredients`
        })
      };

      const response = await fetch('/api/food-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(entryData)
      });

      if (response.ok) {
        toast({
          title: t("common.success"),
          description: t("foodDiary.entryAddedSuccessfully")
        });
        fetchFoodEntries();
        // Reset form
        setNewEntry({
          category: 'breakfast',
          menu: '',
          amount: '',
          carb: 0,
          protein: 0,
          fats: 0,
          sugar: 0,
          calories: 0,
          thoughts: ''
        });
        setIngredients([]);
        setEntryMode('dish');
        setShowAddDialog(false);
      } else {
        const data = await response.json();
        toast({
          title: t("common.error"),
          description: data.error || t("foodDiary.errorAddingEntry"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("common.connectionError"),
        variant: "destructive"
      });
    }
  };

  // Edit food entry
  const editFoodEntry = async () => {
    if (!user?.id || !editingEntry) {
      toast({
        title: t("common.error"),
        description: t("foodDiary.pleaseLogInToEdit"),
        variant: "destructive"
      });
      return;
    }

    if (!editingEntry.menu) {
      toast({
        title: t("common.error"),
        description: t("foodDiary.pleaseEnterMenuItem"),
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/food-entries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(editingEntry)
      });

      if (response.ok) {
        toast({
          title: t("common.success"),
          description: t("foodDiary.entryUpdatedSuccessfully")
        });
        fetchFoodEntries();
        setEditingEntry(null);
        setShowEditDialog(false);
      } else {
        const data = await response.json();
        toast({
          title: t("common.error"),
          description: data.error || t("foodDiary.errorUpdatingEntry"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("common.connectionError"),
        variant: "destructive"
      });
    }
  };

  // Delete food entry
  const deleteFoodEntry = async (id: string) => {
    if (!user?.id) {
      toast({
        title: t("common.error"),
        description: t("foodDiary.pleaseLogInToDelete"),
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/food-entries?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      });

      if (response.ok) {
        toast({
          title: t("common.success"),
          description: t("foodDiary.entryDeletedSuccessfully")
        });
        fetchFoodEntries();
      } else {
        const data = await response.json();
        toast({
          title: t("common.error"),
          description: data.error || t("foodDiary.errorDeletingEntry"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("common.connectionError"),
        variant: "destructive"
      });
    }
  };

  // Handle edit button click
  const handleEditClick = (entry: FoodEntry) => {
    setEditingEntry(entry);
    setShowEditDialog(true);
  };

  useEffect(() => {
    fetchFoodEntries();
  }, []);

  // Check for openAddDialog query parameter and open modal automatically
  useEffect(() => {
    const openAddDialog = searchParams.get('openAddDialog');
    if (openAddDialog === 'true') {
      setShowAddDialog(true);
      // Clean up the URL by removing the query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('openAddDialog');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Calculate nutrition metrics
  const nutritionMetrics: NutritionMetrics = foodEntries.reduce(
    (acc, entry) => ({
      totalCalories: acc.totalCalories + (entry.calories || 0),
      totalCarbs: acc.totalCarbs + (entry.carb || 0),
      totalProteins: acc.totalProteins + (entry.protein || 0),
      totalFats: acc.totalFats + (entry.fats || 0),
      totalSugar: acc.totalSugar + (entry.sugar || 0),
      waterIntake: acc.waterIntake, // This would come from a separate water tracking
      mood: acc.mood // This would be calculated from thoughts
    }),
    {
      totalCalories: 0,
      totalCarbs: 0,
      totalProteins: 0,
      totalFats: 0,
      totalSugar: 0,
      waterIntake: 8, // Default value
      mood: 'Good'
    }
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast': return '#8cbe9b';
      case 'lunch': return '#7da4c5';
      case 'dinner': return '#a991be';
      case 'snack': return '#f29a64';
      default: return '#a3cbaf';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snack': return 'Snacks';
      default: return category;
    }
  };

  const getMoodColor = (thought: string) => {
    switch (thought.toLowerCase()) {
      case 'energized':
        return 'bg-green-100 text-green-700';
      case 'quite satisfied':
        return 'bg-blue-100 text-blue-700';
      case 'satisfied':
        return 'bg-green-100 text-green-700';
      case 'guilty':
        return 'bg-red-100 text-red-700';
      case 'uncomfortable':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredEntries = foodEntries.filter(entry => {
    const matchesSearch = (entry.menu || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'All' || entry.category === filterBy;
    return matchesSearch && matchesFilter;
  });

  // Aplicar paginación a las entradas filtradas
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedEntries,
    goToPage
  } = usePagination(filteredEntries, ITEMS_PER_PAGE);

  const metricsData = [
    {
      title: 'Total Calories',
      value: nutritionMetrics.totalCalories.toLocaleString(),
      unit: 'kcal',
      change: '+1.65%',
      changeType: 'positive',
      description: 'vs last week',
      icon: '🔥',
      color: 'green'
    },
    {
      title: 'Total Carbs',
      value: nutritionMetrics.totalCarbs.toLocaleString(),
      unit: 'gr',
      change: '+0.70%',
      changeType: 'positive',
      description: 'vs last week',
      icon: '🥖',
      color: 'orange'
    },
    {
      title: 'Total Proteins',
      value: nutritionMetrics.totalProteins.toLocaleString(),
      unit: 'gr',
      change: '-2.84%',
      changeType: 'negative',
      description: 'vs last week',
      icon: '🥩',
      color: 'orange'
    },
    {
      title: 'Total Fats',
      value: nutritionMetrics.totalFats.toLocaleString(),
      unit: 'gr',
      change: '+4.15%',
      changeType: 'positive',
      description: 'vs last week',
      icon: '🥑',
      color: 'gray'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Food Diary</h1>
          <p className="text-xl text-gray-600">
            Track your daily nutrition and eating habits
          </p>
        </motion.div>

        {/* Nutrition Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {metricsData.map((metric, index) => (
            <Card key={index} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    metric.color === 'green' ? 'bg-green-100' :
                    metric.color === 'orange' ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-xl">{metric.icon}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{metric.title}</p>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-xl font-semibold">{metric.value}</span>
                    <span className="text-xs text-gray-500">{metric.unit}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Badge 
                      className={`text-xs px-2 py-1 ${
                        metric.changeType === 'positive' 
                          ? 'bg-pastel-green-100 text-pastel-green-700' 
                          : 'bg-pastel-pink-100 text-pastel-pink-700'
                      }`}
                    >
                      {metric.change}
                    </Badge>
                    <span className="text-xs text-gray-500 text-center">{metric.description}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                {/* Search Bar - Full Width */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t("foodDiary.searchMenu")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                
                {/* Filters and Actions - Responsive Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex gap-3 flex-1">
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder={t("foodDiary.filter")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">{t("foodDiary.all")}</SelectItem>
                        <SelectItem value="breakfast">{t("foodDiary.breakfast")}</SelectItem>
                        <SelectItem value="lunch">{t("foodDiary.lunch")}</SelectItem>
                        <SelectItem value="snack">{t("foodDiary.snack")}</SelectItem>
                        <SelectItem value="dinner">{t("foodDiary.dinner")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={timeFrame} onValueChange={setTimeFrame}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="This Week">This Week</SelectItem>
                        <SelectItem value="Last Week">Last Week</SelectItem>
                        <SelectItem value="This Month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 w-full sm:w-auto">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Food Entry</DialogTitle>
                        <DialogDescription>
                          Log your meal with nutritional information and mood.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {/* Entry Mode Selector */}
                        <div className="space-y-2">
                          <Label>Entry Mode</Label>
                          <div className="flex space-x-2">
                            <Button
                              variant={entryMode === 'dish' ? 'default' : 'outline'}
                              onClick={() => setEntryMode('dish')}
                              className="flex-1"
                            >
                              🍽️ Complete Dish
                            </Button>
                            <Button
                              variant={entryMode === 'ingredients' ? 'default' : 'outline'}
                              onClick={() => setEntryMode('ingredients')}
                              className="flex-1"
                            >
                              🥕 Ingredients
                            </Button>
                          </div>
                        </div>
                        
                        {/* Meal Category - Common for both modes */}
                        <div className="space-y-2">
                          <Label htmlFor="category">Meal Category</Label>
                          <Select 
                            value={newEntry.category} 
                            onValueChange={(value: any) => setNewEntry({...newEntry, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                              <SelectItem value="lunch">🍽️ Lunch</SelectItem>
                              <SelectItem value="snack">🍎 Snacks</SelectItem>
                              <SelectItem value="dinner">🍽️ Dinner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Dish Mode Form */}
                        {entryMode === 'dish' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="menu">Menu Item</Label>
                              <Input
                                id="menu"
                                value={newEntry.menu}
                                onChange={(e) => setNewEntry({...newEntry, menu: e.target.value})}
                                placeholder="e.g., Grilled Chicken Salad"
                              />
                            </div>
                          </>
                        )}

                        {/* Ingredients Mode Form */}
                        {entryMode === 'ingredients' && (
                          <div className="space-y-6">
                            
                            {/* Fruits/Vegetables Ingredients */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Fruits/Vegetables</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addIngredient('fruits_vegetables')}
                                >
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              {ingredients.filter(ing => ing.type === 'fruits_vegetables').map((ingredient, index) => {
                                const globalIndex = ingredients.findIndex(ing => ing === ingredient);
                                return (
                                    <div key={ingredient.id || index} className="grid grid-cols-12 gap-2 items-end">
                                      <div className="col-span-4">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Ingredient Name</Label>
                                          <div className="relative">
                                            <Input
                                              placeholder="e.g., Apple"
                                              value={ingredient.name}
                                              onChange={(e) => {
                                                updateIngredient(globalIndex, 'name', e.target.value);
                                                handleIngredientSearch(ingredient.id || '', e.target.value);
                                              }}
                                              onFocus={() => handleIngredientSearch(ingredient.id || '', ingredient.name)}
                                            />
                                            {getIngredientSearch(ingredient.id || '') && availableIngredients.length > 0 && (
                                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {getIngredientsByType(ingredient.type)
                                                  .filter(ing => 
                                                    ing.name.toLowerCase().includes(getIngredientSearch(ingredient.id || '').toLowerCase())
                                                  )
                                                  .slice(0, 5)
                                                  .map((dbIngredient) => (
                                                    <button
                                                      key={dbIngredient.id}
                                                      type="button"
                                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                                                      onClick={() => {
                                                        updateIngredient(globalIndex, 'name', dbIngredient.name);
                                                        handleIngredientSearch(ingredient.id || '', '');
                                                      }}
                                                    >
                                                      {dbIngredient.name}
                                                      {dbIngredient.calories_per_100g && (
                                                        <span className="text-gray-500 ml-2">
                                                          ({dbIngredient.calories_per_100g} cal/100g)
                                                        </span>
                                                      )}
                                                    </button>
                                                  ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Quantity</Label>
                                          <Input
                                            type="number"
                                            placeholder="100"
                                            value={ingredient.quantity}
                                            onChange={(e) => updateIngredient(globalIndex, 'quantity', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Unit</Label>
                                          <Select
                                            value={ingredient.unit}
                                            onValueChange={(value) => updateIngredient(globalIndex, 'unit', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="g">g (grams)</SelectItem>
                                              <SelectItem value="kg">kg (kilograms)</SelectItem>
                                              <SelectItem value="ml">ml (milliliters)</SelectItem>
                                              <SelectItem value="l">l (liters)</SelectItem>
                                              <SelectItem value="cups">cups</SelectItem>
                                              <SelectItem value="pieces">pieces</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="col-span-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Calories</Label>
                                          <Input
                                            type="number"
                                            placeholder="52"
                                            value={ingredient.calories}
                                            onChange={(e) => updateIngredient(globalIndex, 'calories', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-1">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium invisible">Delete</Label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeIngredient(globalIndex)}
                                            className="w-full"
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                );
                              })}
                            </div>

                            {/* Carbs Ingredients */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Carbs</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addIngredient('carbs')}
                                >
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              {ingredients.filter(ing => ing.type === 'carbs').map((ingredient, index) => {
                                const globalIndex = ingredients.findIndex(ing => ing === ingredient);
                                return (
                                    <div key={ingredient.id || index} className="grid grid-cols-12 gap-2 items-end">
                                      <div className="col-span-4">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Ingredient Name</Label>
                                          <div className="relative">
                                            <Input
                                              placeholder="e.g., Apple"
                                              value={ingredient.name}
                                              onChange={(e) => {
                                                updateIngredient(globalIndex, 'name', e.target.value);
                                                handleIngredientSearch(ingredient.id || '', e.target.value);
                                              }}
                                              onFocus={() => handleIngredientSearch(ingredient.id || '', ingredient.name)}
                                            />
                                            {getIngredientSearch(ingredient.id || '') && availableIngredients.length > 0 && (
                                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {getIngredientsByType(ingredient.type)
                                                  .filter(ing => 
                                                    ing.name.toLowerCase().includes(getIngredientSearch(ingredient.id || '').toLowerCase())
                                                  )
                                                  .slice(0, 5)
                                                  .map((dbIngredient) => (
                                                    <button
                                                      key={dbIngredient.id}
                                                      type="button"
                                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                                                      onClick={() => {
                                                        updateIngredient(globalIndex, 'name', dbIngredient.name);
                                                        handleIngredientSearch(ingredient.id || '', '');
                                                      }}
                                                    >
                                                      {dbIngredient.name}
                                                      {dbIngredient.calories_per_100g && (
                                                        <span className="text-gray-500 ml-2">
                                                          ({dbIngredient.calories_per_100g} cal/100g)
                                                        </span>
                                                      )}
                                                    </button>
                                                  ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Quantity</Label>
                                          <Input
                                            type="number"
                                            placeholder="100"
                                            value={ingredient.quantity}
                                            onChange={(e) => updateIngredient(globalIndex, 'quantity', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Unit</Label>
                                          <Select
                                            value={ingredient.unit}
                                            onValueChange={(value) => updateIngredient(globalIndex, 'unit', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="g">g (grams)</SelectItem>
                                              <SelectItem value="kg">kg (kilograms)</SelectItem>
                                              <SelectItem value="ml">ml (milliliters)</SelectItem>
                                              <SelectItem value="l">l (liters)</SelectItem>
                                              <SelectItem value="cups">cups</SelectItem>
                                              <SelectItem value="pieces">pieces</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="col-span-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Calories</Label>
                                          <Input
                                            type="number"
                                            placeholder="52"
                                            value={ingredient.calories}
                                            onChange={(e) => updateIngredient(globalIndex, 'calories', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-1">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium invisible">Delete</Label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeIngredient(globalIndex)}
                                            className="w-full"
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                );
                              })}
                            </div>

                            {/* Proteins Ingredients */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Proteins</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addIngredient('proteins')}
                                >
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              {ingredients.filter(ing => ing.type === 'proteins').map((ingredient, index) => {
                                const globalIndex = ingredients.findIndex(ing => ing === ingredient);
                                return (
                                    <div key={ingredient.id || index} className="grid grid-cols-12 gap-2 items-end">
                                      <div className="col-span-4">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Ingredient Name</Label>
                                          <div className="relative">
                                            <Input
                                              placeholder="e.g., Apple"
                                              value={ingredient.name}
                                              onChange={(e) => {
                                                updateIngredient(globalIndex, 'name', e.target.value);
                                                handleIngredientSearch(ingredient.id || '', e.target.value);
                                              }}
                                              onFocus={() => handleIngredientSearch(ingredient.id || '', ingredient.name)}
                                            />
                                            {getIngredientSearch(ingredient.id || '') && availableIngredients.length > 0 && (
                                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {getIngredientsByType(ingredient.type)
                                                  .filter(ing => 
                                                    ing.name.toLowerCase().includes(getIngredientSearch(ingredient.id || '').toLowerCase())
                                                  )
                                                  .slice(0, 5)
                                                  .map((dbIngredient) => (
                                                    <button
                                                      key={dbIngredient.id}
                                                      type="button"
                                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                                                      onClick={() => {
                                                        updateIngredient(globalIndex, 'name', dbIngredient.name);
                                                        handleIngredientSearch(ingredient.id || '', '');
                                                      }}
                                                    >
                                                      {dbIngredient.name}
                                                      {dbIngredient.calories_per_100g && (
                                                        <span className="text-gray-500 ml-2">
                                                          ({dbIngredient.calories_per_100g} cal/100g)
                                                        </span>
                                                      )}
                                                    </button>
                                                  ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Quantity</Label>
                                          <Input
                                            type="number"
                                            placeholder="100"
                                            value={ingredient.quantity}
                                            onChange={(e) => updateIngredient(globalIndex, 'quantity', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Unit</Label>
                                          <Select
                                            value={ingredient.unit}
                                            onValueChange={(value) => updateIngredient(globalIndex, 'unit', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="g">g (grams)</SelectItem>
                                              <SelectItem value="kg">kg (kilograms)</SelectItem>
                                              <SelectItem value="ml">ml (milliliters)</SelectItem>
                                              <SelectItem value="l">l (liters)</SelectItem>
                                              <SelectItem value="cups">cups</SelectItem>
                                              <SelectItem value="pieces">pieces</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="col-span-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Calories</Label>
                                          <Input
                                            type="number"
                                            placeholder="52"
                                            value={ingredient.calories}
                                            onChange={(e) => updateIngredient(globalIndex, 'calories', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-1">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium invisible">Delete</Label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeIngredient(globalIndex)}
                                            className="w-full"
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                );
                              })}
                            </div>

                            {/* Fats Ingredients */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Fats</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addIngredient('fats')}
                                >
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              {ingredients.filter(ing => ing.type === 'fats').map((ingredient, index) => {
                                const globalIndex = ingredients.findIndex(ing => ing === ingredient);
                                return (
                                    <div key={ingredient.id || index} className="grid grid-cols-12 gap-2 items-end">
                                      <div className="col-span-4">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Ingredient Name</Label>
                                          <div className="relative">
                                            <Input
                                              placeholder="e.g., Apple"
                                              value={ingredient.name}
                                              onChange={(e) => {
                                                updateIngredient(globalIndex, 'name', e.target.value);
                                                handleIngredientSearch(ingredient.id || '', e.target.value);
                                              }}
                                              onFocus={() => handleIngredientSearch(ingredient.id || '', ingredient.name)}
                                            />
                                            {getIngredientSearch(ingredient.id || '') && availableIngredients.length > 0 && (
                                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {getIngredientsByType(ingredient.type)
                                                  .filter(ing => 
                                                    ing.name.toLowerCase().includes(getIngredientSearch(ingredient.id || '').toLowerCase())
                                                  )
                                                  .slice(0, 5)
                                                  .map((dbIngredient) => (
                                                    <button
                                                      key={dbIngredient.id}
                                                      type="button"
                                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                                                      onClick={() => {
                                                        updateIngredient(globalIndex, 'name', dbIngredient.name);
                                                        handleIngredientSearch(ingredient.id || '', '');
                                                      }}
                                                    >
                                                      {dbIngredient.name}
                                                      {dbIngredient.calories_per_100g && (
                                                        <span className="text-gray-500 ml-2">
                                                          ({dbIngredient.calories_per_100g} cal/100g)
                                                        </span>
                                                      )}
                                                    </button>
                                                  ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Quantity</Label>
                                          <Input
                                            type="number"
                                            placeholder="100"
                                            value={ingredient.quantity}
                                            onChange={(e) => updateIngredient(globalIndex, 'quantity', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Unit</Label>
                                          <Select
                                            value={ingredient.unit}
                                            onValueChange={(value) => updateIngredient(globalIndex, 'unit', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="g">g (grams)</SelectItem>
                                              <SelectItem value="kg">kg (kilograms)</SelectItem>
                                              <SelectItem value="ml">ml (milliliters)</SelectItem>
                                              <SelectItem value="l">l (liters)</SelectItem>
                                              <SelectItem value="cups">cups</SelectItem>
                                              <SelectItem value="pieces">pieces</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="col-span-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Calories</Label>
                                          <Input
                                            type="number"
                                            placeholder="52"
                                            value={ingredient.calories}
                                            onChange={(e) => updateIngredient(globalIndex, 'calories', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-1">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium invisible">Delete</Label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeIngredient(globalIndex)}
                                            className="w-full"
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                );
                              })}
                            </div>

                            {/* Others Ingredients */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Others</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addIngredient('others')}
                                >
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              {ingredients.filter(ing => ing.type === 'others').map((ingredient, index) => {
                                const globalIndex = ingredients.findIndex(ing => ing === ingredient);
                                return (
                                    <div key={ingredient.id || index} className="grid grid-cols-12 gap-2 items-end">
                                      <div className="col-span-4">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Ingredient Name</Label>
                                          <div className="relative">
                                            <Input
                                              placeholder="e.g., Apple"
                                              value={ingredient.name}
                                              onChange={(e) => {
                                                updateIngredient(globalIndex, 'name', e.target.value);
                                                handleIngredientSearch(ingredient.id || '', e.target.value);
                                              }}
                                              onFocus={() => handleIngredientSearch(ingredient.id || '', ingredient.name)}
                                            />
                                            {getIngredientSearch(ingredient.id || '') && availableIngredients.length > 0 && (
                                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {getIngredientsByType(ingredient.type)
                                                  .filter(ing => 
                                                    ing.name.toLowerCase().includes(getIngredientSearch(ingredient.id || '').toLowerCase())
                                                  )
                                                  .slice(0, 5)
                                                  .map((dbIngredient) => (
                                                    <button
                                                      key={dbIngredient.id}
                                                      type="button"
                                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                                                      onClick={() => {
                                                        updateIngredient(globalIndex, 'name', dbIngredient.name);
                                                        handleIngredientSearch(ingredient.id || '', '');
                                                      }}
                                                    >
                                                      {dbIngredient.name}
                                                      {dbIngredient.calories_per_100g && (
                                                        <span className="text-gray-500 ml-2">
                                                          ({dbIngredient.calories_per_100g} cal/100g)
                                                        </span>
                                                      )}
                                                    </button>
                                                  ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Quantity</Label>
                                          <Input
                                            type="number"
                                            placeholder="100"
                                            value={ingredient.quantity}
                                            onChange={(e) => updateIngredient(globalIndex, 'quantity', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Unit</Label>
                                          <Select
                                            value={ingredient.unit}
                                            onValueChange={(value) => updateIngredient(globalIndex, 'unit', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="g">g (grams)</SelectItem>
                                              <SelectItem value="kg">kg (kilograms)</SelectItem>
                                              <SelectItem value="ml">ml (milliliters)</SelectItem>
                                              <SelectItem value="l">l (liters)</SelectItem>
                                              <SelectItem value="cups">cups</SelectItem>
                                              <SelectItem value="pieces">pieces</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="col-span-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium">Calories</Label>
                                          <Input
                                            type="number"
                                            placeholder="52"
                                            value={ingredient.calories}
                                            onChange={(e) => updateIngredient(globalIndex, 'calories', Number(e.target.value))}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-1">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-gray-600 font-medium invisible">Delete</Label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeIngredient(globalIndex)}
                                            className="w-full"
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                );
                              })}
                            </div>
                            
                            {ingredients.length > 0 && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Total Calories:</span>
                                  <span className="text-lg font-bold text-pastel-green-600">
                                    {calculateTotalCalories()} kcal
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Additional fields for dish mode */}
                        {entryMode === 'dish' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="amount">Amount/Serving</Label>
                              <Input
                                id="amount"
                                value={newEntry.amount}
                                onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                                placeholder="e.g., 1 bowl, 2 slices"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="calories">Calories (optional)</Label>
                                <Input
                                  id="calories"
                                  type="number"
                                  value={newEntry.calories}
                                  onChange={(e) => setNewEntry({...newEntry, calories: Number(e.target.value)})}
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="carb">Carbs (g) - optional</Label>
                                <Input
                                  id="carb"
                                  type="number"
                                  value={newEntry.carb}
                                  onChange={(e) => setNewEntry({...newEntry, carb: Number(e.target.value)})}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="protein">Protein (g) - optional</Label>
                                <Input
                                  id="protein"
                                  type="number"
                                  value={newEntry.protein}
                                  onChange={(e) => setNewEntry({...newEntry, protein: Number(e.target.value)})}
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="fats">Fats (g) - optional</Label>
                                <Input
                                  id="fats"
                                  type="number"
                                  value={newEntry.fats}
                                  onChange={(e) => setNewEntry({...newEntry, fats: Number(e.target.value)})}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Mood/Thoughts - Common for both modes */}
                        <div className="space-y-2">
                          <Label htmlFor="thoughts">How did you feel?</Label>
                          <Select 
                            value={newEntry.thoughts} 
                            onValueChange={(value) => setNewEntry({...newEntry, thoughts: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("foodDiary.selectMood")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Energized">{t("foodDiary.energized")}</SelectItem>
                              <SelectItem value="Quite Satisfied">{t("foodDiary.quiteSatisfied")}</SelectItem>
                              <SelectItem value="Satisfied">{t("foodDiary.satisfied")}</SelectItem>
                              <SelectItem value="Guilty">{t("foodDiary.guilty")}</SelectItem>
                              <SelectItem value="Uncomfortable">{t("foodDiary.uncomfortable")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={addFoodEntry}
                          className="bg-pastel-green-500 hover:bg-pastel-green-600"
                        >
                          Add Entry
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading food entries...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8">
                  <CaloriesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filterBy !== 'All' 
                      ? t("foodDiary.noEntriesFound")
                      : t("foodDiary.noEntriesYet")
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card Layout */}
                  <div className="block lg:hidden space-y-4 p-4">
                    {paginatedEntries.map((entry) => (
                      <Card key={entry.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <CaloriesIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-base truncate">{entry.menu}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  className="text-xs px-2 py-1"
                                  style={{ 
                                    backgroundColor: getCategoryColor(entry.category) + '20',
                                    color: getCategoryColor(entry.category),
                                    border: `1px solid ${getCategoryColor(entry.category)}`
                                  }}
                                >
                                  {getCategoryLabel(entry.category)}
                                </Badge>
                                <Badge className={`text-xs px-2 py-1 ${getMoodColor(entry.thoughts)}`}>
                                  {entry.thoughts}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(entry)}
                              className="h-8 w-8 p-0"
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFoodEntry(entry.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <span className="ml-2 font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Hora:</span>
                            <span className="ml-2 font-medium">{entry.time}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cantidad:</span>
                            <span className="ml-2 font-medium">{entry.amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Calorías:</span>
                            <span className="ml-2 font-medium">{entry.calories} kcal</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t">
                          <div className="text-center">
                            <div className="text-gray-500">Carbohidratos</div>
                            <div className="font-medium">{entry.carb}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Proteína</div>
                            <div className="font-medium">{entry.protein}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Grasas</div>
                            <div className="font-medium">{entry.fats}g</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden lg:block">
                    <div className="px-6 py-4 border-b">
                      <div className="grid grid-cols-10 gap-4 py-3 text-sm font-medium text-gray-500">
                        <div>Date & Time</div>
                        <div>Category</div>
                        <div>Menu</div>
                        <div>Amount</div>
                        <div className="text-center">Carbs</div>
                        <div className="text-center">Protein</div>
                        <div className="text-center">Fats</div>
                        <div className="text-center">Calories</div>
                        <div>Mood</div>
                        <div className="text-center">Actions</div>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6">
                      <div className="space-y-1">
                        {paginatedEntries.map((entry) => (
                          <div key={entry.id} className="grid grid-cols-10 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-pastel-green-500 rounded-full"></div>
                              <div>
                                <div className="text-sm">{new Date(entry.date).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">{entry.time}</div>
                              </div>
                            </div>
                            <div>
                              <Badge 
                                className="text-xs px-2 py-1"
                                style={{ 
                                  backgroundColor: getCategoryColor(entry.category) + '20',
                                  color: getCategoryColor(entry.category),
                                  border: `1px solid ${getCategoryColor(entry.category)}`
                                }}
                              >
                                {getCategoryLabel(entry.category)}
                              </Badge>
                            </div>
                            <div className="text-sm">{entry.menu}</div>
                            <div className="text-sm">{entry.amount}</div>
                            <div className="text-sm text-center">{entry.carb}g</div>
                            <div className="text-sm text-center">{entry.protein}g</div>
                            <div className="text-sm text-center">{entry.fats}g</div>
                            <div className="text-sm text-center font-medium">{entry.calories} kcal</div>
                            <div>
                              <Badge className={`text-xs px-2 py-1 ${getMoodColor(entry.thoughts)}`}>
                                {entry.thoughts}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(entry)}
                                className="h-8 w-8 p-0"
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteFoodEntry(entry.id)}
                                className="h-8 w-8 p-0 text-pastel-pink-600 hover:text-pastel-pink-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    totalItems={filteredEntries.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    showInfo={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>


        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Food Entry</DialogTitle>
              <DialogDescription>
                Update your food diary entry details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={editingEntry?.category || 'breakfast'}
                  onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack') =>
                    setEditingEntry(prev => prev ? { ...prev, category: value } : null)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-menu" className="text-right">
                  Menu *
                </Label>
                <Input
                  id="edit-menu"
                  value={editingEntry?.menu || ''}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, menu: e.target.value } : null)}
                  className="col-span-3"
                  placeholder="e.g., Grilled Chicken Salad"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="edit-amount"
                  value={editingEntry?.amount || ''}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, amount: e.target.value } : null)}
                  className="col-span-3"
                  placeholder="e.g., 1 plate, 2 slices"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="edit-carb" className="text-right text-sm">
                    Carbs (optional)
                  </Label>
                  <Input
                    id="edit-carb"
                    type="number"
                    value={editingEntry?.carb || 0}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, carb: parseFloat(e.target.value) || 0 } : null)}
                    className="col-span-3"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="edit-protein" className="text-right text-sm">
                    Protein (optional)
                  </Label>
                  <Input
                    id="edit-protein"
                    type="number"
                    value={editingEntry?.protein || 0}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, protein: parseFloat(e.target.value) || 0 } : null)}
                    className="col-span-3"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="edit-fats" className="text-right text-sm">
                    Fats (optional)
                  </Label>
                  <Input
                    id="edit-fats"
                    type="number"
                    value={editingEntry?.fats || 0}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, fats: parseFloat(e.target.value) || 0 } : null)}
                    className="col-span-3"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="edit-sugar" className="text-right text-sm">
                    Sugar (optional)
                  </Label>
                  <Input
                    id="edit-sugar"
                    type="number"
                    value={editingEntry?.sugar || 0}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, sugar: parseFloat(e.target.value) || 0 } : null)}
                    className="col-span-3"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-calories" className="text-right">
                  Calories (optional)
                </Label>
                <Input
                  id="edit-calories"
                  type="number"
                  value={editingEntry?.calories || 0}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, calories: parseFloat(e.target.value) || 0 } : null)}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-thoughts" className="text-right">
                  Mood
                </Label>
                <Select
                  value={editingEntry?.thoughts || 'Satisfied'}
                  onValueChange={(value) =>
                    setEditingEntry(prev => prev ? { ...prev, thoughts: value } : null)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Energized">{t("foodDiary.energized")}</SelectItem>
                    <SelectItem value="Quite Satisfied">{t("foodDiary.quiteSatisfied")}</SelectItem>
                    <SelectItem value="Satisfied">{t("foodDiary.satisfied")}</SelectItem>
                    <SelectItem value="Neutral">{t("foodDiary.neutral")}</SelectItem>
                    <SelectItem value="Unsatisfied">{t("foodDiary.unsatisfied")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={editFoodEntry}>
                Update Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
