# Deployment Checklist for NutriMate

## Required Environment Variables for Vercel:

### Supabase (Already configured)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

### LemonSqueezy (For payments)
- NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID
- NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID
- LEMONSQUEEZY_API_KEY
- LEMONSQUEEZY_WEBHOOK_SECRET

### AI Integration (For meal planning)
- GROQ_API_KEY (Already configured)

## Deployment Steps:
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Post-Deployment:
- Test authentication flow
- Verify database connections
- Test payment integration
- Confirm AI assistant functionality
