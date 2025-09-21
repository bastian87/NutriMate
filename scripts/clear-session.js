// Script para limpiar la sesión persistente de Supabase
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando sesión persistente...');

// Limpiar localStorage
localStorage.removeItem('sb-wlqsitedbkghsucxoyoc-auth-token');
localStorage.removeItem('supabase.auth.token');
localStorage.removeItem('temp_user_data');
localStorage.removeItem('userPreferences');

// Limpiar sessionStorage
sessionStorage.clear();

// Limpiar cookies relacionadas con Supabase
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Sesión limpiada. Recarga la página.');
