import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Cloud, CloudOff, Loader2, LogIn, LogOut, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/hooks/useCloudSync';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { emailNickname, resolveDisplayName } from '@/lib/profileIdentity';

function friendlyError(message: string, translate: (key: TranslationKey) => string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return translate('account.invalidCredentials');
  if (normalized.includes('user already registered')) return translate('account.alreadyRegistered');
  if (normalized.includes('password should be')) return translate('account.weakPassword');
  if (normalized.includes('email not confirmed')) return translate('account.emailNotConfirmed');
  return message;
}

export default function Account() {
  const [, setLocation] = useLocation();
  const { configured, user, loading, signIn, signUp, signOut } = useAuth();
  const { profile, setProfile } = useProfile();
  const { status, lastError } = useCloudSync();
  const { language, t } = useLanguage();
  const initialMode = useMemo<'login' | 'signup'>(() => {
    const requested = new URLSearchParams(window.location.search).get('mode');
    return requested === 'signup' ? 'signup' : 'login';
  }, []);
  const cameFromWelcome = useMemo(() => new URLSearchParams(window.location.search).get('from') === 'welcome', []);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'signup') {
        const submittedName = name.trim() || emailNickname(email) || (language === 'ru' ? 'Пользователь CoffeeMind' : 'CoffeeMind User');
        const result = await signUp(email.trim(), password, submittedName);
        setProfile((current) => ({ ...current, name: submittedName }));
        setMessage(result.needsConfirmation ? t('account.signupConfirmation') : t('account.signupSuccess'));
      } else {
        await signIn(email.trim(), password);
        setMessage(t('account.loginSuccess'));
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : t('account.operationFailed'), t));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOut();
      setMessage(t('account.signOutSuccess'));
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : t('account.signOutFailed'), t));
    } finally {
      setBusy(false);
    }
  };

  const displayName = useMemo(() => resolveDisplayName({
    profileName: profile.name,
    metadataName: typeof user?.user_metadata?.name === 'string' ? user.user_metadata.name : '',
    email: user?.email,
    language,
    authenticated: Boolean(user),
  }), [language, profile.name, user]);

  const statusLabel = status === 'synced'
    ? t('account.synced')
    : status === 'syncing' || status === 'loading'
      ? t('account.syncing')
      : status === 'error'
        ? t('account.syncError')
        : t('account.localMode');

  return (
    <div className="min-h-full bg-background px-4 iphone-safe-top pb-28">
      <header className="flex items-center gap-3 mb-7">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (cameFromWelcome && window.history.length > 1) window.history.back();
            else setLocation('/settings');
          }}
          className="w-9 h-9 rounded-full bg-card/60 border border-white/[0.07] flex items-center justify-center text-muted-foreground"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={20} />
        </motion.button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">{t('account.cloud')}</p>
          <h1 className="font-serif text-[1.65rem] font-medium">{mode === 'signup' && !user ? t('account.createTitle') : t('account.title')}</h1>
        </div>
      </header>

      {!configured ? (
        <div className="bg-card/60 border border-amber-500/20 rounded-[24px] p-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <CloudOff size={21} className="text-amber-400" />
          </div>
          <h2 className="font-serif text-xl mb-2">{t('account.notConfiguredTitle')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t('account.notConfiguredText')}</p>
        </div>
      ) : loading ? (
        <div className="min-h-[45vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : user ? (
        <div className="space-y-4">
          <div className="bg-card/60 border border-white/[0.07] rounded-[24px] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Mail size={20} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{t('account.accountLabel')}</p>
                <p className="font-medium truncate">{displayName}</p>
                <p className="text-[12px] text-muted-foreground truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-card/60 border border-white/[0.07] rounded-[24px] p-5">
            <div className="flex items-center gap-3 mb-2">
              {status === 'error' ? <CloudOff size={18} className="text-red-400" /> : <Cloud size={18} className="text-primary" />}
              <p className="font-medium">{statusLabel}</p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{t('account.syncDescription')}</p>
            {lastError && <p className="text-[12px] text-red-400 mt-3 break-words">{lastError}</p>}
          </div>

          <div className="bg-card/60 border border-white/[0.07] rounded-[24px] p-5 flex gap-3">
            <ShieldCheck size={19} className="text-emerald-400 mt-0.5" />
            <p className="text-[12px] text-muted-foreground leading-relaxed">{t('account.rls')}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
            {t('account.signOut')}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-card/60 border border-white/[0.07] rounded-[24px] p-5">
            <div className="flex p-1 bg-black/30 rounded-xl mb-5">
              <button
                onClick={() => { setMode('login'); setError(null); setMessage(null); }}
                className={`flex-1 h-9 rounded-lg text-[13px] font-semibold transition-colors ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {t('account.loginTab')}
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                className={`flex-1 h-9 rounded-lg text-[13px] font-semibold transition-colors ${mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {t('account.signupTab')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] text-muted-foreground ml-1 mb-1.5 block">{t('account.name')}</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('account.namePlaceholder')} className="h-12 rounded-2xl bg-background" />
                </div>
              )}
              <div>
                <label className="text-[11px] text-muted-foreground ml-1 mb-1.5 block">{t('account.email')}</label>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="name@example.com" className="h-12 rounded-2xl bg-background" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground ml-1 mb-1.5 block">{t('account.password')}</label>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={t('account.passwordPlaceholder')} className="h-12 rounded-2xl bg-background" />
              </div>

              {error && <p className="text-[12px] text-red-400 bg-red-950/30 border border-red-900/30 rounded-xl px-3 py-2.5">{error}</p>}
              {message && <p className="text-[12px] text-emerald-300 bg-emerald-950/20 border border-emerald-900/30 rounded-xl px-3 py-2.5">{message}</p>}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={busy}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {busy ? <Loader2 size={17} className="animate-spin" /> : mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
                {mode === 'login' ? t('account.loginSubmit') : t('account.signupSubmit')}
              </motion.button>
            </form>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center px-5 leading-relaxed">{t('account.firstLogin')}</p>
        </div>
      )}
    </div>
  );
}
