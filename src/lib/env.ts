export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== 'false',
  staticExport: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true',
};

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey);
}
