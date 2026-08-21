'use client';

import {Loader2} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {useRouter} from '@/i18n/navigation';
import {Alert} from '@/components/ui/Alert';
import {Button} from '@/components/ui/Button';
import {Field, inputClass} from '@/components/ui/Field';
import {Panel} from '@/components/ui/Panel';
import {createClient} from '@/lib/supabase/client';
import {isSupabaseConfigured} from '@/lib/env';

export function LoginForm() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    if (!isSupabaseConfigured()) {
      setError(t('notConfigured'));
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const result = await supabase.auth.signInWithPassword({email, password});
      if (result.error) {
        setError(t('loginFailed'));
        return;
      }
      router.push('/admin');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Panel className="mx-auto max-w-md p-6 md:p-8">
      <form onSubmit={submit}>
        <h1 className="text-section font-semibold text-ink">{t('loginTitle')}</h1>

        <div className="mt-6 grid gap-4">
          <Field label={t('email')}>
            {(field) => (
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                {...field}
                className={inputClass()}
              />
            )}
          </Field>
          <Field label={t('password')}>
            {(field) => (
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                {...field}
                className={inputClass()}
              />
            )}
          </Field>
        </div>

        {error && (
          <Alert tone="danger" live="alert" className="mt-4">
            {error}
          </Alert>
        )}

        <Button as="button" type="submit" disabled={pending} className="mt-6 w-full">
          {pending && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {t('login')}
        </Button>
      </form>
    </Panel>
  );
}
