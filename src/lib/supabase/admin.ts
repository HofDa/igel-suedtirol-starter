import {createClient} from '@supabase/supabase-js';
import {publicEnv} from '@/lib/env';

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!publicEnv.supabaseUrl || !serviceKey) return null;
  return createClient(publicEnv.supabaseUrl, serviceKey, {
    auth: {autoRefreshToken: false, persistSession: false}
  });
}
