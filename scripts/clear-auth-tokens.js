// Script para limpiar tokens de autenticación de Supabase
// Ejecutar en la consola del navegador si es necesario

function clearSupabaseTokens() {
  console.log("🧹 Limpiando tokens de Supabase...")
  
  // Limpiar todos los tokens relacionados con Supabase
  const keysToRemove = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('supabase') || 
      key.includes('sb-') ||
      key.includes('auth-token') ||
      key.includes('refresh-token')
    )) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`Removing: ${key}`)
    localStorage.removeItem(key)
  })
  
  // Limpiar también sessionStorage
  sessionStorage.clear()
  
  console.log("✅ Tokens limpiados exitosamente")
  console.log("🔄 Recarga la página para aplicar los cambios")
}

// Ejecutar automáticamente
clearSupabaseTokens()

// También exportar la función para uso manual
if (typeof window !== 'undefined') {
  window.clearSupabaseTokens = clearSupabaseTokens
}
