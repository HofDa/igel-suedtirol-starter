import 'server-only';

import {createClient} from '@supabase/supabase-js';
import {publicEnv} from '@/lib/env';

export function createPublicClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabasePublishableKey) return null;
  return createClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    auth: {autoRefreshToken: false, persistSession: false}
  });
}
