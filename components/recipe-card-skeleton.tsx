export function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="relative">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="absolute top-3 left-3 bg-gray-200 px-2 py-1 rounded-full w-16 h-6"></div>
        <div className="absolute top-3 right-3 bg-gray-200 w-8 h-8 rounded"></div>
      </div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  )
}
