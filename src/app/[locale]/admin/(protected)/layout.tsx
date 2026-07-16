import {redirect} from 'next/navigation';
import {isSupabaseConfigured} from '@/lib/env';
import {createClient} from '@/lib/supabase/server';
import type {UserRole} from '@/types/database';

type Props = {children: React.ReactNode; params: Promise<{locale: string}>};
const staffRoles = new Set<UserRole>(['moderator', 'expert', 'admin']);

export default async function AdminLayout({children, params}: Props) {
  const {locale} = await params;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {data} = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) redirect(`/${locale}/admin/login`);

    const {data: profile} = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (!profile || !staffRoles.has(profile.role as UserRole)) redirect(`/${locale}`);
  }
  return <>{children}</>;
}
