# 🗑️ Política de Eliminación de Datos - NutriMate

## Cuándo un Usuario Elimina su Cuenta

### ✅ **Datos que SE ELIMINAN**

Estos datos son específicos del usuario y se eliminan completamente:

- **Perfil de usuario** (`users`) - Información personal
- **Preferencias** (`user_preferences`) - Configuraciones dietéticas
- **Favoritos** (`user_favorites`) - Recetas guardadas como favoritas
- **Planes de comida** (`meal_plans` + `meal_plan_meals`) - Planes personalizados
- **Listas de compras** (`grocery_lists` + `grocery_list_items`) - Listas personales
- **Suscripciones** (`user_subscriptions`) - Estado de suscripción
- **Recetas creadas** (`recipes` + `recipe_ingredients`) - Recetas propias del usuario

### 🔒 **Datos que NO SE ELIMINAN**

Estos datos se preservan para el beneficio de la comunidad:

- **Calificaciones de recetas** (`recipe_ratings`) - **PRESERVADAS**
  - Razón: Mantienen la reputación y popularidad de las recetas
  - Beneficio: Ayudan a otros usuarios a encontrar recetas de calidad
  - Impacto: Contribuyen al sistema de recomendaciones

## 🎯 **Justificación de la Política**

### **Datos Personales vs. Datos Comunitarios**

**Datos Personales (Se Eliminan):**
- Son específicos del usuario
- No aportan valor a otros usuarios
- Contienen información privada

**Datos Comunitarios (Se Preservan):**
- Benefician a toda la comunidad
- Contribuyen al sistema de reputación
- Mejoran la experiencia de todos los usuarios

### **Ejemplo Práctico**

Si un usuario con 100 calificaciones elimina su cuenta:
- ❌ **Se pierden**: Sus favoritos, planes de comida, listas de compras
- ✅ **Se preservan**: Sus 100 calificaciones de recetas
- 🎯 **Resultado**: La comunidad mantiene información valiosa sobre qué recetas son buenas

## 🔧 **Implementación Técnica**

### **Orden de Eliminación**
1. `user_favorites` - Favoritos personales
2. `meal_plan_meals` - Comidas en planes (antes que los planes)
3. `meal_plans` - Planes de comida
4. `grocery_list_items` - Items en listas (antes que las listas)
5. `grocery_lists` - Listas de compras
6. `user_subscriptions` - Suscripciones
7. `recipe_ingredients` - Ingredientes de recetas propias
8. `recipes` - Recetas creadas por el usuario
9. `user_preferences` - Preferencias personales
10. `users` - Perfil del usuario

### **Datos Preservados**
- `recipe_ratings` - **NO se eliminan** para mantener reputación comunitaria

## 📊 **Impacto en la Comunidad**

### **Beneficios de Preservar Ratings**
- ✅ **Sistema de reputación robusto**
- ✅ **Recomendaciones más precisas**
- ✅ **Recetas populares identificadas**
- ✅ **Calidad de contenido mantenida**

### **Privacidad del Usuario**
- ✅ **Datos personales eliminados completamente**
- ✅ **Anonimización efectiva**
- ✅ **Cumplimiento de GDPR/privacidad**

## 🛡️ **Cumplimiento Legal**

Esta política cumple con:
- **GDPR**: Derecho al olvido (datos personales eliminados)
- **Privacidad**: Información personal protegida
- **Comunidad**: Datos valiosos preservados para todos

---

*Esta política está diseñada para equilibrar la privacidad del usuario con el valor comunitario de los datos.* 