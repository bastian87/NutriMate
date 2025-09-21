// Error handler para contentScript.js
(function() {
  'use strict';
  
  // Interceptar errores globales
  window.addEventListener('error', function(event) {
    // Verificar si el error viene de contentScript.js
    if (event.filename && event.filename.includes('contentScript.js')) {
      console.warn('ContentScript error intercepted:', event.error);
      
      // Prevenir que el error se propague
      event.preventDefault();
      event.stopPropagation();
      
      // Intentar recuperar el elemento si es null
      if (event.error && event.error.message && event.error.message.includes('indexOf')) {
        console.warn('Attempting to recover from indexOf error...');
        
        // Buscar elementos que podrían estar causando el problema
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          if (el && typeof el.innerHTML === 'string' && el.innerHTML.includes('indexOf')) {
            console.warn('Found element with indexOf reference:', el);
          }
        });
      }
    }
  });
  
  // Interceptar errores no capturados
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('indexOf')) {
      console.warn('Unhandled promise rejection with indexOf error:', event.reason);
      event.preventDefault();
    }
  });
})();
