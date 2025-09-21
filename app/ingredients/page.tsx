"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { Search, Plus, Edit, Trash2, Apple, Fish, Wheat, Droplets } from "lucide-react";

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
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

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
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIngredient)
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
      case 'carb': return <Wheat className="w-4 h-4" />;
      case 'protein': return <Fish className="w-4 h-4" />;
      case 'fat': return <Droplets className="w-4 h-4" />;
      case 'vegfruit': return <Apple className="w-4 h-4" />;
      case 'treat': return <Plus className="w-4 h-4" />;
      default: return <Plus className="w-4 h-4" />;
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("ingredients.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("ingredients.subtitle")}
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ingredients.searchAndFilter")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">{t("ingredients.searchIngredient")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder={t("ingredients.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">{t("ingredients.nutritionalGroup")}</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("ingredients.allGroups")}</SelectItem>
                  <SelectItem value="carb">{t("ingredients.groups.carb")}</SelectItem>
                  <SelectItem value="protein">{t("ingredients.groups.protein")}</SelectItem>
                  <SelectItem value="fat">{t("ingredients.groups.fat")}</SelectItem>
                  <SelectItem value="vegfruit">{t("ingredients.groups.vegfruit")}</SelectItem>
                  <SelectItem value="treat">{t("ingredients.groups.treat")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("ingredients.actions")}</Label>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("ingredients.addIngredient")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Ingredient Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t("ingredients.addNewIngredient")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ingredientName">{t("ingredients.name")}</Label>
                <Input
                  id="ingredientName"
                  placeholder={t("ingredients.namePlaceholder")}
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredientGroup">{t("ingredients.group")}</Label>
                <Select 
                  value={newIngredient.group} 
                  onValueChange={(value: any) => setNewIngredient({...newIngredient, group: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carb">{t("ingredients.groups.carb")}</SelectItem>
                    <SelectItem value="protein">{t("ingredients.groups.protein")}</SelectItem>
                    <SelectItem value="fat">{t("ingredients.groups.fat")}</SelectItem>
                    <SelectItem value="vegfruit">{t("ingredients.groups.vegfruit")}</SelectItem>
                    <SelectItem value="treat">{t("ingredients.groups.treat")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredientKcal">{t("ingredients.caloriesPer100g")}</Label>
                <Input
                  id="ingredientKcal"
                  type="number"
                  placeholder={t("ingredients.caloriesPlaceholder")}
                  value={newIngredient.kcalPer100g}
                  onChange={(e) => setNewIngredient({...newIngredient, kcalPer100g: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={addIngredient}>
                {t("ingredients.addIngredient")}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t("ingredients.cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredients List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("ingredients.ingredientsDatabase")} ({t("ingredients.ingredientsCount", { count: filteredIngredients.length })})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("ingredients.loadingIngredients")}</p>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-8">
              <Apple className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedGroup !== 'all' 
                  ? t("ingredients.noIngredientsFound")
                  : t("ingredients.noIngredientsInDatabase")
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIngredients.map((ingredient) => (
                <div key={ingredient.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getGroupIcon(ingredient.group)}
                      <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                    </div>
                    <Badge className={getGroupColor(ingredient.group)}>
                      {getGroupLabel(ingredient.group)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t("ingredients.caloriesPer100gLabel")}</span>
                      <span className="font-medium">{ingredient.kcalPer100g} kcal</span>
                    </div>                    
                  </div>

                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
