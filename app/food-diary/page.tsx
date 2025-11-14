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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/components/auth/simple-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { 
  SearchIcon, 
  PlusIcon, 
} from "@/components/icons-new";
import { Edit as EditIcon, Trash2 as TrashIcon, X, Info, Camera } from 'lucide-react';
import { QuickMealLogger } from "@/components/quick-meal-logger";
import { ImageWithFallback } from "@/components/image-with-fallback";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FoodEntry {
  id: string;
  date: string;
  time: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  menu?: string;
  amount?: string;
  carb?: number;
  protein?: number;
  fats?: number;
  sugar?: number;
  calories?: number;
  thoughts?: string;
  image_url?: string;
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    menu: '',
    calories: '',
    category: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageToRemove, setEditImageToRemove] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Fetch food entries
  const fetchFoodEntries = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/food-entries', {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFoodEntries(data.entries || []);
      } else {
        throw new Error('Failed to fetch entries');
      }
    } catch (error) {
      console.error('Error fetching food entries:', error);
      toast({
        title: t("common.error"),
        description: t("foodDiary.errorFetchingEntries"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Check for openAddDialog query parameter
  useEffect(() => {
    const openAddDialog = searchParams.get('openAddDialog');
    if (openAddDialog === 'true') {
      setShowAddDialog(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('openAddDialog');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

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
        headers: { 'x-user-id': user.id }
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

  // Handle edit
  const handleEditClick = (entry: FoodEntry) => {
    setEditingEntry(entry);
    setEditForm({
      menu: entry.menu || '',
      calories: entry.calories?.toString() || '',
      category: entry.category
    });
    // Reset image state
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageToRemove(false);
    setShowEditDialog(true);
  };

  const handleEditImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t("common.error"),
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("common.error"),
        description: "Image size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setEditImageFile(file);
    setEditImageToRemove(false); // If user selects new image, don't remove

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageToRemove(true);
    // Reset file input
    const fileInput = document.getElementById('edit-meal-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditSubmit = async () => {
    if (!user?.id || !editingEntry) return;

    if (!editForm.menu.trim()) {
      toast({
        title: t("common.error"),
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    let imageUrl: string | null = editingEntry.image_url || null;

    // Handle image upload/removal
    if (editImageToRemove) {
      // User wants to remove the image
      imageUrl = null;
    } else if (editImageFile) {
      // User selected a new image - upload it
      setUploadingEditImage(true);
      try {
        const formData = new FormData();
        formData.append('image', editImageFile);

        const uploadResponse = await fetch("/api/upload-meal-image", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
        } else {
          // If upload fails, keep existing image (non-blocking)
          const errorData = await uploadResponse.json();
          console.warn('Image upload failed:', errorData.error);
          toast({
            title: "Image upload failed",
            description: "Meal will be updated without changing the photo",
            variant: "default"
          });
          // Keep the existing image_url
          imageUrl = editingEntry.image_url || null;
        }
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Keep existing image on error
        imageUrl = editingEntry.image_url || null;
      } finally {
        setUploadingEditImage(false);
      }
    }
    // If neither editImageFile nor editImageToRemove, keep existing image_url

    try {
      const response = await fetch('/api/food-entries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          id: editingEntry.id,
          menu: editForm.menu,
          calories: editForm.calories ? parseFloat(editForm.calories) : null,
          category: editForm.category,
          carb: editingEntry.carb || 0,
          protein: editingEntry.protein || 0,
          fats: editingEntry.fats || 0,
          sugar: editingEntry.sugar || 0,
          image_url: imageUrl,
          amount: editingEntry.amount || null
        })
      });

      if (response.ok) {
        toast({
          title: t("common.success"),
          description: t("foodDiary.entryUpdatedSuccessfully")
        });
        fetchFoodEntries();
        setShowEditDialog(false);
        setEditingEntry(null);
        // Reset image state
        setEditImageFile(null);
        setEditImagePreview(null);
        setEditImageToRemove(false);
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

  // Filter entries
  const filteredEntries = foodEntries.filter(entry => {
    const matchesSearch = (entry.menu || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'All' || entry.category === filterBy;
    return matchesSearch && matchesFilter;
  });

  // Calculate totals
  const totals = filteredEntries.reduce((acc, entry) => ({
    calories: acc.calories + (entry.calories || 0),
    carbs: acc.carbs + (entry.carb || 0),
    protein: acc.protein + (entry.protein || 0),
    fats: acc.fats + (entry.fats || 0)
  }), { calories: 0, carbs: 0, protein: 0, fats: 0 });

  // Count meals without calories
  const mealsWithoutCalories = filteredEntries.filter(entry => 
    !entry.calories || entry.calories === null
  ).length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast': return 'bg-green-100 text-green-700';
      case 'lunch': return 'bg-blue-100 text-blue-700';
      case 'dinner': return 'bg-purple-100 text-purple-700';
      case 'snack': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snack': return 'Snack';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Food Diary</h1>
              <p className="text-gray-600 mt-1">Track your meals quickly and easily</p>
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Calories</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(totals.calories)}</p>
                {mealsWithoutCalories > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {mealsWithoutCalories} {mealsWithoutCalories === 1 ? 'meal' : 'meals'} without calories
                  </p>
                )}
                  </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Protein</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(totals.protein)}g</p>
                  </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Carbs</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(totals.carbs)}g</p>
                  </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Fats</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(totals.fats)}g</p>
                </div>
              </CardContent>
            </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search meals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                    <SelectItem value="All">All Meals</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No meals found</p>
                  <Button onClick={() => setShowAddDialog(true)} variant="outline">
                    Add Your First Meal
                                </Button>
                              </div>
              ) : (
                            <TooltipProvider>
                            <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Thumbnail */}
                        {entry.image_url ? (
                          <div 
                            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedImage(entry.image_url || null);
                              setShowImageModal(true);
                            }}
                          >
                            <ImageWithFallback
                              src={entry.image_url}
                              alt={entry.menu || 'Meal image'}
                              className="w-full h-full object-cover"
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                        <Badge className={getCategoryColor(entry.category)}>
                                  {getCategoryLabel(entry.category)}
                                </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{entry.menu || 'Unnamed meal'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()} • {entry.time}
                          </p>
                              </div>
                        <div className="text-right">
                          {entry.calories ? (
                            <p className="font-semibold text-orange-600">{Math.round(entry.calories)} kcal</p>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-gray-400 hover:text-gray-500 cursor-help">
                                  <Info className="w-4 h-4" />
                                  <span className="text-xs">No calories logged</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This meal doesn't have calories recorded</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {(() => {
                            const macros = [];
                            if (entry.protein && entry.protein > 0) macros.push(`P: ${entry.protein}g`);
                            if (entry.carb && entry.carb > 0) macros.push(`C: ${entry.carb}g`);
                            if (entry.fats && entry.fats > 0) macros.push(`F: ${entry.fats}g`);
                            return macros.length > 0 ? (
                              <p className="text-xs text-gray-500">{macros.join(' • ')}</p>
                            ) : null;
                          })()}
                            </div>
                          </div>
                      <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(entry)}
                            >
                          <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFoodEntry(entry.id)}
                            >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                  ))}
                </div>
                            </TooltipProvider>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Meal Logger */}
        <QuickMealLogger
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={fetchFoodEntries}
        />

        {/* Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl p-0">
            {selectedImage && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
                  onClick={() => setShowImageModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100">
                  <ImageWithFallback
                    src={selectedImage}
                    alt="Meal image"
                    className="max-w-full max-h-full object-contain"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Meal</DialogTitle>
              <DialogDescription>Update meal details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Meal Name</Label>
                <Input
                  value={editForm.menu}
                  onChange={(e) => setEditForm({ ...editForm, menu: e.target.value })}
                  placeholder="Meal name"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={editForm.calories}
                    onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                <Select
                    value={editForm.category}
                    onValueChange={(value: any) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger className="mt-1">
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
              </div>

              {/* Photo Section */}
              <div>
                <Label>Photo (optional)</Label>
                <div className="mt-1 space-y-2">
                  {editImagePreview || (editingEntry?.image_url && !editImageToRemove) ? (
                    <div className="relative">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <ImageWithFallback
                          src={editImagePreview || editingEntry?.image_url || ''}
                          alt="Meal preview"
                          className="w-full h-full object-cover"
                          style={{ width: '100%', height: '100%' }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={handleRemoveEditImage}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          id="edit-meal-image-input"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleEditImageSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('edit-meal-image-input')?.click()}
                          className="flex-1"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Change photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveEditImage}
                          className="flex-1"
                        >
                          Remove photo
                        </Button>
                      </div>
                      {editImageFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          {editImageFile.name} ({editImageFile.size / 1024 / 1024 < 1 
                            ? `${Math.round(editImageFile.size / 1024)} KB`
                            : `${(editImageFile.size / 1024 / 1024).toFixed(2)} MB`})
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        id="edit-meal-image-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleEditImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-meal-image-input')?.click()}
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Add photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} disabled={uploadingEditImage}>
                {uploadingEditImage ? "Uploading photo..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
