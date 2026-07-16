import {createServerClient} from '@supabase/ssr';
import type {NextRequest} from 'next/server';
import type {NextResponse} from 'next/server';
import {publicEnv} from '@/lib/env';

export async function updateSession(request: NextRequest, response: NextResponse) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabasePublishableKey) return response;

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
        cookiesToSet.forEach(({name, value, options}) => response.cookies.set(name, value, options));
      }
    }
  });

  await supabase.auth.getClaims();
  return response;
}
