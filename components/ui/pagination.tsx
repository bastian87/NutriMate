"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons-new"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showInfo?: boolean
  totalItems?: number
  itemsPerPage?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalItems,
  itemsPerPage,
  className
}: PaginationProps) {
  // Calcular información de elementos
  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = totalItems && itemsPerPage 
    ? Math.min(currentPage * itemsPerPage, totalItems) 
    : 0

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Páginas iniciales
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Páginas finales
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Páginas del medio
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4", className)}>
      {/* Información de elementos */}
      {showInfo && totalItems && itemsPerPage && (
        <div className="text-sm text-gray-500">
          Mostrando {startItem}-{endItem} de {totalItems} elementos
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Anterior
        </Button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
              disabled={typeof page !== 'number'}
              className={cn(
                "w-10 h-10 p-0 rounded-xl font-medium transition-all duration-200",
                page === currentPage
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "hover:bg-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600",
                typeof page !== 'number' && "cursor-default hover:bg-transparent border-transparent"
              )}
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Botón Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Hook para manejar la lógica de paginación
export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = items.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const resetPagination = () => {
    setCurrentPage(1)
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  }
}
