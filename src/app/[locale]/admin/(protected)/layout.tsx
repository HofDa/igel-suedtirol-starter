import {redirect} from '@/i18n/navigation';
import {isSupabaseConfigured} from '@/lib/env';
import {createClient} from '@/lib/supabase/server';
import type {UserRole} from '@/types/database';

type Props = {children: React.ReactNode; params: Promise<{locale: string}>};
const staffRoles = new Set<UserRole>(['moderator', 'expert', 'admin']);

// Die Anmeldeseite liegt bewusst außerhalb dieser Route-Gruppe:
// ein Redirect dorthin darf nie wieder durch diesen Guard laufen.
export default async function AdminProtectedLayout({children, params}: Props) {
  const {locale} = await params;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {data} = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) redirect({href: '/admin/login', locale});

    const {data: profile} = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (!profile || !staffRoles.has(profile.role as UserRole)) redirect({href: '/', locale});
  }
  return <>{children}</>;
}
