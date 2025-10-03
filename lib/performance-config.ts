// Configuración de rendimiento para la aplicación
export const PERFORMANCE_CONFIG = {
  // Límites de datos para evitar cargar demasiado contenido
  RECIPES_LIMIT: 20,
  INGREDIENTS_LIMIT: 50,
  FOOD_ENTRIES_LIMIT: 100,
  
  // Timeouts para evitar cargas infinitas
  API_TIMEOUT: 10000, // 10 segundos
  DEBOUNCE_DELAY: 300, // 300ms para búsquedas
  
  // Configuración de caché
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Configuración de imágenes
  IMAGE_QUALITY: 75,
  IMAGE_SIZES: [640, 750, 828, 1080, 1200, 1920],
  
  // Configuración de paginación
  PAGINATION_SIZE: 20,
  
  // Configuración de lazy loading
  LAZY_LOAD_OFFSET: 100, // Píxeles antes de cargar
}

// Función para debounce de búsquedas
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Función para throttle de eventos
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Función para crear un timeout con Promise
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms)
  })
}

// Función para crear una consulta con timeout
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = PERFORMANCE_CONFIG.API_TIMEOUT
): Promise<T> {
  return Promise.race([
    promise,
    createTimeout(timeoutMs)
  ])
}
