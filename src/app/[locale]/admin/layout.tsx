import {redirect} from 'next/navigation';
import {isSupabaseConfigured} from '@/lib/env';
import {createClient} from '@/lib/supabase/server';

type Props = {children: React.ReactNode; params: Promise<{locale: string}>};

export default async function AdminLayout({children, params}: Props) {
  const {locale} = await params;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {data} = await supabase.auth.getClaims();
    if (!data?.claims) redirect(`/${locale}/admin/login`);
  }
  return <>{children}</>;
}
