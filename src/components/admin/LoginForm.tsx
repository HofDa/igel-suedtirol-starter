'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {useRouter} from '@/i18n/navigation';
import {createClient} from '@/lib/supabase/client';
import {isSupabaseConfigured} from '@/lib/env';

export function LoginForm() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    if (!isSupabaseConfigured()) {
      setError(t('notConfigured'));
      return;
    }
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({email, password});
    if (result.error) {
      setError(t('loginFailed'));
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md p-8">
      <h1 className="text-2xl font-black text-ink">{t('loginTitle')}</h1>
      <label className="mt-6 block font-bold">{t('email')}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4" required /></label>
      <label className="mt-4 block font-bold">{t('password')}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4" required /></label>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 font-bold text-red-800">{error}</p>}
      <button className="mt-6 min-h-12 w-full rounded-full bg-forest-dark font-bold text-white">{t('login')}</button>
    </form>
  );
}
