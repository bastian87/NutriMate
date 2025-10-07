import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/types/database';

export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

export function createServerClientWithCookies(request: NextRequest, response: NextResponse) {
  // Crear un objeto cookies que implementa la interfaz que espera Supabase
  const cookieStore = {
    get: (name: string) => request.cookies.get(name),
    getAll: () => request.cookies.getAll(),
    set: (name: string, value: string, options: any) => {
      response.cookies.set(name, value, options);
    },
    remove: (name: string, options: any) => {
      response.cookies.delete(name);
    },
  };

  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
}