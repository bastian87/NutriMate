'use client';

/**
 * Plate builder component with drag & drop functionality
 */

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/auth/simple-auth-provider';
import { evaluateDay } from '@/lib/nutri/validation';
import { PLATE_BUILDER } from '@/lib/i18n/en';
import type { Ingredient, DayEntryItem, MacroGroup } from '@/types/nutri';
import { Search, Plus, Trash2, Check, X } from 'lucide-react';

/**
 * Extended day entry item with ID for component state
 */
interface DayEntryItemWithId extends DayEntryItem {
  id: string;
}

/**
 * Plate slot interface
 */
interface PlateSlot {
  id: string;
  group: MacroGroup;
  items: DayEntryItemWithId[];
  maxItems: number;
}

/**
 * Droppable plate slot component using native HTML5 drag & drop
 */
function DroppablePlateSlot({ 
  slot, 
  children, 
  onDrop 
}: { 
  slot: PlateSlot; 
  children: React.ReactNode;
  onDrop: (ingredient: Ingredient, slotId: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const [dragData, setDragData] = useState<Ingredient | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
    
    // Get drag data - but only if we don't already have it
    if (!dragData) {
      const ingredientData = e.dataTransfer.getData('application/json');
      if (ingredientData) {
        try {
          const ingredient = JSON.parse(ingredientData);
          setDragData(ingredient);
        } catch (error) {
          console.error('Error parsing drag data:', error);
        }
      }
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
    setDragData(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const ingredientData = e.dataTransfer.getData('application/json');
    if (ingredientData) {
      try {
        const ingredient = JSON.parse(ingredientData);
        onDrop(ingredient, slot.id);
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    }
    setDragData(null);
  };

  // Determine if the dragged ingredient is valid for this slot
  const isValidDrop = dragData ? (
    (slot.group === 'carb' && dragData.group === 'carb') ||
    (slot.group === 'protein' && dragData.group === 'protein') ||
    (slot.group === 'fat' && dragData.group === 'fat') ||
    (slot.group === 'vegfruit' && dragData.group === 'vegfruit') ||
    (slot.group === 'treat' && dragData.group === 'treat')
  ) : true; // If no drag data, don't show any color (neutral)

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all duration-200 ${
        isOver 
          ? isValidDrop
            ? 'bg-green-50 border-green-300 ring-2 ring-green-200 scale-105' 
            : 'bg-red-50 border-red-300 ring-2 ring-red-200 scale-105'
          : 'hover:bg-gray-50'
      }`}
    >
      {children}
    </div>
  );
}

/**
 * Draggable ingredient component using native HTML5 drag & drop
 */
function DraggableIngredient({ ingredient }: { ingredient: Ingredient }) {
  const [isDragging, setIsDragging] = useState(false);

  const getCategoryColor = (group: string) => {
    switch (group) {
      case 'carb': return 'bg-pastel-yellow-100 text-pastel-yellow-800 border-pastel-yellow-200';
      case 'protein': return 'bg-pastel-pink-100 text-pastel-pink-800 border-pastel-pink-200';
      case 'fat': return 'bg-pastel-purple-100 text-pastel-purple-800 border-pastel-purple-200';
      case 'vegfruit': return 'bg-pastel-green-100 text-pastel-green-800 border-pastel-green-200';
      case 'treat': return 'bg-pastel-orange-100 text-pastel-orange-800 border-pastel-orange-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify(ingredient));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`flex items-center justify-between p-2 bg-card border rounded cursor-grab hover:bg-muted transition-all duration-200 ${
        isDragging ? 'opacity-30 scale-95' : 'hover:shadow-md'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium">{ingredient.name}</div>
          <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(ingredient.group)}`}>
            {ingredient.group}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{ingredient.kcalPer100g} kcal/100g</div>
      </div>
      <Button variant="ghost" size="sm">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * Plate builder props
 */
interface PlateBuilderProps {
  date: string;
  goalId: string;
  targetKcal: number;
  onSave: (items: DayEntryItem[]) => Promise<void>;
}


/**
 * PlateBuilder component
 */
export default function PlateBuilder({ date, goalId, targetKcal, onSave }: PlateBuilderProps) {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MacroGroup>('carb');
  const [saving, setSaving] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  // Initialize plate slots
  const [plateSlots, setPlateSlots] = useState<PlateSlot[]>([
    { id: 'carb-slot', group: 'carb', items: [], maxItems: 3 },
    { id: 'protein-slot', group: 'protein', items: [], maxItems: 3 },
    { id: 'fat-slot', group: 'fat', items: [], maxItems: 2 },
    { id: 'vegfruit-slot', group: 'vegfruit', items: [], maxItems: 4 }
  ]);

  const [extrasBasket, setExtrasBasket] = useState<DayEntryItemWithId[]>([]);
  const [loadingDayData, setLoadingDayData] = useState(true);

  // Load real ingredients from API
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        console.log('PlateBuilder - Loading ingredients...');
        const response = await fetch('/api/ingredients');
        console.log('PlateBuilder - Ingredients response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('PlateBuilder - Ingredients data received:', data);
          setIngredients(data.ingredients || []);
        } else {
          console.error('PlateBuilder - Failed to load ingredients, status:', response.status);
          const errorText = await response.text();
          console.error('PlateBuilder - Error response:', errorText);
          // No fallback to mock data - show empty state
          setIngredients([]);
        }
      } catch (error) {
        console.error('PlateBuilder - Error loading ingredients:', error);
        // No fallback to mock data - show empty state
        setIngredients([]);
      } finally {
        setLoadingIngredients(false);
      }
    };

    loadIngredients();
  }, []);

  // Load existing day data
  useEffect(() => {
    const loadDayData = async () => {
      if (!date || !goalId) {
        console.log('PlateBuilder - Missing date or goalId:', { date, goalId });
        setLoadingDayData(false);
        return;
      }

      // Clear existing data before loading new data
      setPlateSlots(prev => prev.map(slot => ({ ...slot, items: [] })));
      setExtrasBasket([]);

      try {
        console.log('PlateBuilder - Loading day data for:', { date, goalId });
        const response = await fetch(`/api/day-entries?date=${date}&goalId=${goalId}`, {
          headers: {
            'x-user-id': user?.id || ''
          }
        });
        console.log('PlateBuilder - Day data response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('PlateBuilder - Day data loaded:', data);
          
          if (data.dayEntry && data.items && data.items.length > 0) {
            console.log('PlateBuilder - Found existing day data with', data.items.length, 'items');
            // Group items by their macro group
            const groupedItems: { [key in MacroGroup]: DayEntryItemWithId[] } = {
              carb: [],
              protein: [],
              fat: [],
              vegfruit: [],
              treat: []
            };

            data.items.forEach((item: any) => {
              const dayEntryItem: DayEntryItemWithId = {
                id: item.id,
                ingredientId: item.ingredientId,
                quantityGrams: item.quantityGrams,
                kcal: item.kcal,
                group: item.group
              };

              if (item.group === 'treat') {
                groupedItems.treat.push(dayEntryItem);
              } else {
                groupedItems[item.group as MacroGroup].push(dayEntryItem);
              }
            });

            // Set extras basket separately to avoid duplicates
            setExtrasBasket(groupedItems.treat);

            // Update plate slots with loaded data
            setPlateSlots(prev => prev.map(slot => ({
              ...slot,
              items: groupedItems[slot.group] || []
            })));

            console.log('PlateBuilder - Plate slots updated with loaded data');
          } else {
            console.log('PlateBuilder - No existing day data found');
          }
        } else {
          console.error('PlateBuilder - Failed to load day data, status:', response.status);
          const errorText = await response.text();
          console.error('PlateBuilder - Day data error response:', errorText);
        }
      } catch (error) {
        console.error('PlateBuilder - Error loading day data:', error);
      } finally {
        setLoadingDayData(false);
      }
    };

    loadDayData();
  }, [date, goalId]);

  // Filter ingredients based on search and active tab
  const filteredIngredients = useMemo(() => {
    let filtered = ingredients;
    
    console.log('PlateBuilder - Filtering ingredients:', {
      totalIngredients: ingredients.length,
      activeTab,
      searchQuery,
      firstIngredient: ingredients[0]
    });
    
    if (activeTab !== 'treat') {
      filtered = filtered.filter(ing => ing.group === activeTab);
      console.log('PlateBuilder - After group filter:', filtered.length);
    } else {
      filtered = filtered.filter(ing => ing.group === 'treat');
      console.log('PlateBuilder - After treat filter:', filtered.length);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(ing => 
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('PlateBuilder - After search filter:', filtered.length);
    }
    
    return filtered;
  }, [activeTab, searchQuery, ingredients]);

  // Calculate totals and evaluation
  const allItems = useMemo(() => {
    return [...plateSlots.flatMap(slot => slot.items), ...extrasBasket];
  }, [plateSlots, extrasBasket]);

  const evaluation = useMemo(() => {
    return evaluateDay(allItems, targetKcal);
  }, [allItems, targetKcal]);

  /**
   * Handle drop on plate slots
   */
  const handleDrop = (ingredient: Ingredient, slotId: string) => {
    // Create day entry item
    const dayEntryItem: DayEntryItemWithId = {
      id: `item-${Date.now()}-${Math.random()}`,
      ingredientId: ingredient.id,
      quantityGrams: 100, // Default quantity
      kcal: Math.round(ingredient.kcalPer100g * 100 / 100),
      group: ingredient.group
    };

    // Handle dropping on plate slots
    if (slotId.includes('-slot')) {
      const targetSlot = plateSlots.find(slot => slot.id === slotId);
      if (targetSlot && targetSlot.items.length < targetSlot.maxItems) {
        // Validate that the ingredient belongs to the correct category
        const isValidCategory = (
          (targetSlot.group === 'carb' && ingredient.group === 'carb') ||
          (targetSlot.group === 'protein' && ingredient.group === 'protein') ||
          (targetSlot.group === 'fat' && ingredient.group === 'fat') ||
          (targetSlot.group === 'vegfruit' && ingredient.group === 'vegfruit')
        );
        
        if (isValidCategory) {
          setPlateSlots(prev => prev.map(slot => 
            slot.id === slotId 
              ? { ...slot, items: [...slot.items, dayEntryItem] }
              : slot
          ));
        } else {
          // Show error message for invalid category
          toast({
            title: "Categoría incorrecta",
            description: `${ingredient.name} pertenece a ${ingredient.group}, no a ${targetSlot.group}`,
            variant: "destructive"
          });
        }
      }
    }
    
    // Handle dropping on extras basket
    if (slotId === 'extras-basket') {
      // Only allow treats in extras basket
      if (ingredient.group === 'treat') {
        setExtrasBasket(prev => [...prev, dayEntryItem]);
      } else {
        toast({
          title: "Categoría incorrecta",
          description: `${ingredient.name} no es un treat. Úsalo en la categoría ${ingredient.group}`,
          variant: "destructive"
        });
      }
    }
  };

  /**
   * Add ingredient by typing
   */
  const addIngredientBySearch = (ingredient: Ingredient) => {
    const dayEntryItem: DayEntryItemWithId = {
      id: `item-${Date.now()}-${Math.random()}`,
      ingredientId: ingredient.id,
      quantityGrams: 100,
      kcal: Math.round(ingredient.kcalPer100g * 100 / 100),
      group: ingredient.group
    };

    if (ingredient.group === 'treat') {
      setExtrasBasket(prev => [...prev, dayEntryItem]);
    } else {
      const targetSlot = plateSlots.find(slot => slot.group === ingredient.group);
      if (targetSlot && targetSlot.items.length < targetSlot.maxItems) {
        setPlateSlots(prev => prev.map(slot => 
          slot.group === ingredient.group 
            ? { ...slot, items: [...slot.items, dayEntryItem] }
            : slot
        ));
      }
    }
  };

  /**
   * Remove item from slot
   */
  const removeItem = (slotId: string, itemId: string) => {
    setPlateSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, items: slot.items.filter(item => item.id !== itemId) }
        : slot
    ));
  };

  /**
   * Remove item from extras basket
   */
  const removeExtra = (itemId: string) => {
    setExtrasBasket(prev => prev.filter(item => item.id !== itemId));
  };

  /**
   * Handle save day
   */
  const handleSaveDay = async () => {
    if (allItems.length === 0) {
      toast({
        title: PLATE_BUILDER.TOASTS.EMPTY_PLATE.title,
        description: PLATE_BUILDER.TOASTS.EMPTY_PLATE.description,
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Convert items with ID to items without ID for API
      const itemsForApi: DayEntryItem[] = allItems.map(item => ({
        ingredientId: item.ingredientId,
        quantityGrams: item.quantityGrams,
        kcal: item.kcal,
        group: item.group
      }));
      
      await onSave(itemsForApi);
      
      // Show success toast based on evaluation
      if (evaluation.isSuccess) {
        toast({
          title: PLATE_BUILDER.TOASTS.DAY_COMPLETE.title,
          description: PLATE_BUILDER.TOASTS.DAY_COMPLETE.description,
          variant: "default"
        });
      } else if (evaluation.totalsKcal > targetKcal) {
        toast({
          title: PLATE_BUILDER.TOASTS.CALORIE_EXCESS.title,
          description: PLATE_BUILDER.TOASTS.CALORIE_EXCESS.description,
          variant: "destructive"
        });
      } else if (evaluation.flags.extrasCount > 0) {
        toast({
          title: PLATE_BUILDER.TOASTS.EXTRAS_DETECTED.title,
          description: PLATE_BUILDER.TOASTS.EXTRAS_DETECTED.description,
          variant: "destructive"
        });
      } else {
        toast({
          title: PLATE_BUILDER.TOASTS.MISSING_GROUPS.title,
          description: PLATE_BUILDER.TOASTS.MISSING_GROUPS.description,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: PLATE_BUILDER.TOASTS.SAVE_ERROR.title,
        description: PLATE_BUILDER.TOASTS.SAVE_ERROR.description,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingIngredients || loadingDayData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            {loadingIngredients ? 'Cargando ingredientes...' : 'Cargando datos del día...'}
          </p>
        </div>
      </div>
    );
  }

  // Debug: Log ingredients count
  console.log('PlateBuilder - Ingredients loaded:', ingredients.length);
  console.log('PlateBuilder - Filtered ingredients:', filteredIngredients.length);

  return (
    <TooltipProvider>
        <div className="flex h-full">
          {/* Left panel - Ingredient library */}
          <div className="w-80 border-r bg-gray-50 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{PLATE_BUILDER.LABELS.INGREDIENT_LIBRARY}</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={PLATE_BUILDER.LABELS.SEARCH_PLACEHOLDER}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MacroGroup)}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="carb">Carb</TabsTrigger>
                  <TabsTrigger value="protein">Prot</TabsTrigger>
                  <TabsTrigger value="fat">Fat</TabsTrigger>
                  <TabsTrigger value="vegfruit">Veg</TabsTrigger>
                  <TabsTrigger value="treat">Extra</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredIngredients.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">
                          {ingredients.length === 0 
                            ? "No hay ingredientes disponibles. Contacta al administrador para agregar ingredientes."
                            : "No se encontraron ingredientes para esta categoría."
                          }
                        </p>
                      </div>
                    ) : (
                      filteredIngredients.map((ingredient) => (
                        <DraggableIngredient key={ingredient.id} ingredient={ingredient} />
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right panel - Plate builder */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{PLATE_BUILDER.LABELS.PLATE_BUILDER}</h2>
                  <p className="text-gray-600">Date: {date}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{evaluation.totalsKcal} / {targetKcal} kcal</div>
                  <div className="text-sm text-gray-500">{PLATE_BUILDER.LABELS.DAILY_GOAL}</div>
                </div>
              </div>

              {/* Plate slots */}
              <div className="grid grid-cols-2 gap-4">
                {plateSlots.map((slot) => (
                  <DroppablePlateSlot 
                    key={slot.id} 
                    slot={slot}
                    onDrop={handleDrop}
                  >
                    <Card className="min-h-32">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="capitalize">
                          {slot.group === 'vegfruit' ? PLATE_BUILDER.LABELS.VEGETABLES_FRUITS : slot.group}
                        </span>
                        <Badge variant={slot.items.length > 0 ? 'default' : 'secondary'}>
                          {slot.items.length}/{slot.maxItems}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {slot.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                          >
                            <div>
                              <div className="font-medium">
                                {ingredients.find(ing => ing.id === item.ingredientId)?.name}
                              </div>
                              <div className="text-xs text-gray-500">{item.kcal} kcal</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(slot.id, item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    </Card>
                  </DroppablePlateSlot>
                ))}
              </div>

              {/* Extras basket */}
              <DroppablePlateSlot 
                slot={{ id: 'extras-basket', group: 'treat', items: extrasBasket, maxItems: 999 }}
                onDrop={handleDrop}
              >
                <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between text-red-600">
                    <span>{PLATE_BUILDER.LABELS.EXTRAS_TREATS}</span>
                    <Badge variant={extrasBasket.length > 0 ? 'destructive' : 'secondary'}>
                      {extrasBasket.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {extrasBasket.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-red-50 rounded text-sm"
                      >
                        <div>
                          <div className="font-medium">
                            {ingredients.find(ing => ing.id === item.ingredientId)?.name}
                          </div>
                          <div className="text-xs text-gray-500">{item.kcal} kcal</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExtra(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                </Card>
              </DroppablePlateSlot>

              {/* Status indicators */}
              <div className="flex items-center justify-center space-x-4">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-2">
                      {evaluation.flags.hasCarb ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">{PLATE_BUILDER.LABELS.CARBOHYDRATES}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{evaluation.flags.hasCarb ? PLATE_BUILDER.LABELS.INCLUDED : PLATE_BUILDER.LABELS.MISSING}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-2">
                      {evaluation.flags.hasProtein ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">{PLATE_BUILDER.LABELS.PROTEIN}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{evaluation.flags.hasProtein ? PLATE_BUILDER.LABELS.INCLUDED : PLATE_BUILDER.LABELS.MISSING}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-2">
                      {evaluation.flags.hasFat ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">{PLATE_BUILDER.LABELS.FAT}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{evaluation.flags.hasFat ? PLATE_BUILDER.LABELS.INCLUDED : PLATE_BUILDER.LABELS.MISSING}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-2">
                      {evaluation.flags.hasVegFruit ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">{PLATE_BUILDER.LABELS.VEGETABLES_FRUITS}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{evaluation.flags.hasVegFruit ? PLATE_BUILDER.LABELS.INCLUDED : PLATE_BUILDER.LABELS.MISSING}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Save button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSaveDay}
                  disabled={saving || allItems.length === 0}
                  className="w-full max-w-md"
                >
                  {saving ? PLATE_BUILDER.LABELS.SAVING : PLATE_BUILDER.LABELS.SAVE_DAY}
                </Button>
              </div>
            </div>
          </div>
        </div>

    </TooltipProvider>
  );
}
