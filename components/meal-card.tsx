import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"

interface MealCardProps {
  title: string
  recipe: string
  calories: number
  protein: number
  carbs: number
  fat: number
  prep_time_minutes: number
  cook_time_minutes: number
  image_url: string
}

export default function MealCard({ title, recipe, calories, protein, carbs, fat, prep_time_minutes, cook_time_minutes, image_url }: MealCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={image_url || "/placeholder.svg"} alt={recipe} fill className="object-cover" />
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1 text-sm font-medium">
          {title}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{recipe}</CardTitle>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-1" /> {prep_time_minutes + cook_time_minutes} min
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealCard.calories')}</p>
            <p className="font-semibold">{calories}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealCard.protein')}</p>
            <p className="font-semibold">{protein}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealCard.carbs')}</p>
            <p className="font-semibold">{carbs}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealCard.fat')}</p>
            <p className="font-semibold">{fat}g</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="default" className="w-full flex-1">
            <Link href={`/recipes/${encodeURIComponent(recipe)}`}>View Recipe</Link>
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
