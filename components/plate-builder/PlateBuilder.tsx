'use client';

/**
 * Plate builder component with drag & drop functionality
 */

import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
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
 * Plate builder props
 */
interface PlateBuilderProps {
  date: string;
  goalId: string;
  targetKcal: number;
  onSave: (items: DayEntryItem[]) => Promise<void>;
}

/**
 * Mock ingredients data
 */
const mockIngredients: Ingredient[] = [
  // Carbs
  { id: '1', name: 'rice', locale: 'en', group: 'carb', kcalPer100g: 130 },
  { id: '2', name: 'oats', locale: 'en', group: 'carb', kcalPer100g: 389 },
  { id: '3', name: 'potato', locale: 'en', group: 'carb', kcalPer100g: 77 },
  { id: '4', name: 'whole-wheat bread', locale: 'en', group: 'carb', kcalPer100g: 247 },
  
  // Protein
  { id: '5', name: 'chicken breast', locale: 'en', group: 'protein', kcalPer100g: 165 },
  { id: '6', name: 'egg', locale: 'en', group: 'protein', kcalPer100g: 155 },
  { id: '7', name: 'tuna', locale: 'en', group: 'protein', kcalPer100g: 132 },
  { id: '8', name: 'lentils', locale: 'en', group: 'protein', kcalPer100g: 116 },
  { id: '9', name: 'tofu', locale: 'en', group: 'protein', kcalPer100g: 76 },
  
  // Fat
  { id: '10', name: 'olive oil', locale: 'en', group: 'fat', kcalPer100g: 884 },
  { id: '11', name: 'avocado', locale: 'en', group: 'fat', kcalPer100g: 160 },
  { id: '12', name: 'almonds', locale: 'en', group: 'fat', kcalPer100g: 579 },
  { id: '13', name: 'peanut butter', locale: 'en', group: 'fat', kcalPer100g: 588 },
  
  // Vegetables & Fruits
  { id: '14', name: 'spinach', locale: 'en', group: 'vegfruit', kcalPer100g: 23 },
  { id: '15', name: 'broccoli', locale: 'en', group: 'vegfruit', kcalPer100g: 34 },
  { id: '16', name: 'tomato', locale: 'en', group: 'vegfruit', kcalPer100g: 18 },
  { id: '17', name: 'apple', locale: 'en', group: 'vegfruit', kcalPer100g: 52 },
  { id: '18', name: 'banana', locale: 'en', group: 'vegfruit', kcalPer100g: 89 },
  
  // Treats
  { id: '19', name: 'ice cream', locale: 'en', group: 'treat', kcalPer100g: 207 },
  { id: '20', name: 'soda', locale: 'en', group: 'treat', kcalPer100g: 42 },
  { id: '21', name: 'donut', locale: 'en', group: 'treat', kcalPer100g: 452 },
  { id: '22', name: 'chocolate bar', locale: 'en', group: 'treat', kcalPer100g: 546 }
];

/**
 * PlateBuilder component
 */
export default function PlateBuilder({ date, goalId, targetKcal, onSave }: PlateBuilderProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MacroGroup>('carb');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize plate slots
  const [plateSlots, setPlateSlots] = useState<PlateSlot[]>([
    { id: 'carb-slot', group: 'carb', items: [], maxItems: 3 },
    { id: 'protein-slot', group: 'protein', items: [], maxItems: 3 },
    { id: 'fat-slot', group: 'fat', items: [], maxItems: 2 },
    { id: 'vegfruit-slot', group: 'vegfruit', items: [], maxItems: 4 }
  ]);

  const [extrasBasket, setExtrasBasket] = useState<DayEntryItemWithId[]>([]);

  // Filter ingredients based on search and active tab
  const filteredIngredients = useMemo(() => {
    let filtered = mockIngredients;
    
    if (activeTab !== 'treat') {
      filtered = filtered.filter(ing => ing.group === activeTab);
    } else {
      filtered = filtered.filter(ing => ing.group === 'treat');
    }
    
    if (searchQuery) {
      filtered = filtered.filter(ing => 
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [activeTab, searchQuery]);

  // Calculate totals and evaluation
  const allItems = useMemo(() => {
    return [...plateSlots.flatMap(slot => slot.items), ...extrasBasket];
  }, [plateSlots, extrasBasket]);

  const evaluation = useMemo(() => {
    return evaluateDay(allItems, targetKcal);
  }, [allItems, targetKcal]);

  /**
   * Handle drag start
   */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  /**
   * Handle drag end
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the ingredient being dragged
    const ingredient = mockIngredients.find(ing => ing.id === activeId);
    if (!ingredient) return;

    // Create day entry item
    const dayEntryItem: DayEntryItemWithId = {
      id: `item-${Date.now()}-${Math.random()}`,
      ingredientId: ingredient.id,
      quantityGrams: 100, // Default quantity
      kcal: Math.round(ingredient.kcalPer100g * 100 / 100),
      group: ingredient.group
    };

    // Handle dropping on plate slots
    if (overId.includes('-slot')) {
      const targetSlot = plateSlots.find(slot => slot.id === overId);
      if (targetSlot && targetSlot.items.length < targetSlot.maxItems) {
        setPlateSlots(prev => prev.map(slot => 
          slot.id === overId 
            ? { ...slot, items: [...slot.items, dayEntryItem] }
            : slot
        ));
      }
    }
    
    // Handle dropping on extras basket
    if (overId === 'extras-basket') {
      setExtrasBasket(prev => [...prev, dayEntryItem]);
    }

    setActiveId(null);
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

  return (
    <TooltipProvider>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                    {filteredIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        draggable
                        className="flex items-center justify-between p-2 bg-white border rounded cursor-move hover:bg-gray-50"
                        onClick={() => addIngredientBySearch(ingredient)}
                      >
                        <div>
                          <div className="font-medium text-sm">{ingredient.name}</div>
                          <div className="text-xs text-gray-500">{ingredient.kcalPer100g} kcal/100g</div>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
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
                  <p className="text-gray-600">Date: {new Date(date).toLocaleDateString('en-US')}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{evaluation.totalsKcal} / {targetKcal} kcal</div>
                  <div className="text-sm text-gray-500">{PLATE_BUILDER.LABELS.DAILY_GOAL}</div>
                </div>
              </div>

              {/* Plate slots */}
              <div className="grid grid-cols-2 gap-4">
                {plateSlots.map((slot) => (
                  <Card key={slot.id} id={slot.id} className="min-h-32">
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
                      <SortableContext items={slot.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {slot.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                            >
                              <div>
                                <div className="font-medium">
                                  {mockIngredients.find(ing => ing.id === item.ingredientId)?.name}
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
                      </SortableContext>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Extras basket */}
              <Card id="extras-basket" className="border-red-200">
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
                            {mockIngredients.find(ing => ing.id === item.ingredientId)?.name}
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

        <DragOverlay>
          {activeId ? (
            <div className="p-2 bg-white border rounded shadow-lg">
              {mockIngredients.find(ing => ing.id === activeId)?.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </TooltipProvider>
  );
}
