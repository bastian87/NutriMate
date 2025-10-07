import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/types/database';

export function createServerClient() {
  return createMiddlewareClient<Database>({ 
    req: new NextRequest('http://localhost'), 
    res: new NextResponse() 
  });
}

export function createServerClientWithCookies(request: NextRequest, response: NextResponse) {
  return createMiddlewareClient<Database>({ req: request, res: response });
}