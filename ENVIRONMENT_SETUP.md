# Configuración de Variables de Entorno

Este documento te guía para configurar todas las variables de entorno necesarias para que NutriMate funcione correctamente.

## 🚀 Configuración Rápida

1. **Copia el archivo de ejemplo:**
   ```bash
   cp env.example .env.local
   ```

2. **Ejecuta la verificación:**
   ```bash
   pnpm check-env
   ```

3. **Configura las variables faltantes en `.env.local`**

## 📋 Variables Requeridas

### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Cómo obtenerlas:**
1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API
4. Copia las URLs y claves

### LemonSqueezy Configuration
```env
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your_store_id
NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID=your_monthly_variant_id
NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID=your_annual_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

**Cómo obtenerlas:**
1. Ve a [LemonSqueezy](https://lemonsqueezy.com)
2. Crea una cuenta y una tienda
3. Crea productos con variantes mensual y anual
4. Ve a Settings > API Keys para obtener la clave API
5. Configura webhooks para obtener el secreto

### App Configuration
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 Solución de Problemas

### Error: "No portal URL available"
Este error ocurre cuando:
1. **Falta la clave API de LemonSqueezy**
2. **La suscripción no existe en la base de datos**
3. **El customer_id no es válido**

**Solución:**
1. Verifica que `LEMONSQUEEZY_API_KEY` esté configurada
2. Asegúrate de que el usuario tenga una suscripción activa
3. Revisa los logs del servidor para más detalles

### Error: "No subscription found"
Este error ocurre cuando:
1. **El usuario no tiene una suscripción en la base de datos**
2. **La tabla `user_subscriptions` no existe**

**Solución:**
1. Verifica que el usuario se haya suscrito correctamente
2. Ejecuta los scripts SQL para crear las tablas necesarias

## 📊 Verificación

Después de configurar todas las variables:

```bash
pnpm check-env
```

Deberías ver:
```
🎉 ¡Todas las variables de entorno están configuradas correctamente!
```

## 🔒 Seguridad

- **Nunca** commits el archivo `.env.local` al repositorio
- **Nunca** compartas las claves API públicamente
- Usa diferentes claves para desarrollo y producción

## 🚀 Producción

Para producción, configura las variables en tu plataforma de hosting:
- Vercel: Variables de entorno en el dashboard
- Netlify: Variables de entorno en el dashboard
- Otros: Consulta la documentación de tu proveedor 