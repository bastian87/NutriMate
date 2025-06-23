# 🔒 Guía de Seguridad - NutriMate

## Variables de Entorno y API Keys

### ✅ Variables SEGURAS (Solo en el servidor)

Estas variables **NUNCA** se exponen al cliente y están protegidas:

- `LEMONSQUEEZY_API_KEY` - API Key de LemonSqueezy
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio de Supabase
- `LEMONSQUEEZY_WEBHOOK_SECRET` - Secreto del webhook

### ✅ Variables PÚBLICAS (Seguras para el cliente)

Estas variables están diseñadas para ser públicas:

- `NEXT_PUBLIC_SUPABASE_URL` - URL pública del proyecto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima (permisos limitados)
- `NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID` - ID público de la tienda
- `NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID` - ID público del producto
- `NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID` - ID público del producto

## 🛡️ Medidas de Seguridad Implementadas

### 1. Separación Cliente/Servidor
- Las API keys sensibles solo se usan en archivos del servidor (`/app/api/`, `/lib/`)
- El cliente solo tiene acceso a variables con prefijo `NEXT_PUBLIC_`

### 2. Validación de Entorno
- Script `check-env.ts` verifica que las variables estén configuradas
- No expone valores reales, solo descripciones

### 3. Archivos Protegidos
- `.env*` está en `.gitignore`
- Los scripts de configuración no contienen información real

## 🚨 Prácticas de Seguridad

### ✅ HACER
- Usar variables de entorno para todas las configuraciones
- Mantener las API keys solo en el servidor
- Usar la clave anónima de Supabase en el cliente
- Validar las variables de entorno antes del despliegue

### ❌ NO HACER
- Hardcodear API keys en el código
- Exponer claves de servicio al cliente
- Subir archivos `.env` al repositorio
- Usar la clave de servicio en el cliente

## 🔧 Configuración Local

1. Copia `env.example` a `.env.local`
2. Configura las variables con tus valores reales
3. Nunca subas `.env.local` al repositorio

## 🚀 Despliegue

En producción, configura las variables de entorno en tu plataforma de hosting:
- Vercel: Variables de entorno en el dashboard
- Netlify: Variables de entorno en el dashboard
- Otros: Según la documentación de la plataforma

## 📞 Soporte

Si encuentras problemas de seguridad, contacta inmediatamente al equipo de desarrollo. 