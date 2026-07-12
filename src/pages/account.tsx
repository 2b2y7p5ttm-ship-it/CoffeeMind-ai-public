import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Cloud, CloudOff, Loader2, LogIn, LogOut, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/hooks/useCloudSync';
import { Input } from '@/components/ui/input';

function friendlyError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'Неверный email или пароль.';
  if (normalized.includes('user already registered')) return 'Пользователь с таким email уже зарегистрирован.';
  if (normalized.includes('password should be')) return 'Пароль должен содержать не менее 6 символов.';
  if (normalized.includes('email not confirmed')) return 'Подтверди email по ссылке из письма.';
  return message;
}

export default function Account() {
  const [, setLocation] = useLocation();
  const { configured, user, loading, signIn, signUp, signOut } = useAuth();
  const { status, lastError } = useCloudSync();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
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
        const result = await signUp(email.trim(), password, name.trim() || 'CoffeeMind User');
        setMessage(result.needsConfirmation
          ? 'Аккаунт создан. Открой письмо Supabase и подтверди email.'
          : 'Аккаунт создан. Данные синхронизируются.');
      } else {
        await signIn(email.trim(), password);
        setMessage('Вход выполнен. Локальные данные синхронизируются с облаком.');
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Не удалось выполнить операцию.'));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOut();
      setMessage('Ты вышел из аккаунта. Локальные данные остаются на устройстве.');
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Не удалось выйти.'));
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = status === 'synced'
    ? 'Все данные синхронизированы'
    : status === 'syncing' || status === 'loading'
      ? 'Синхронизация…'
      : status === 'error'
        ? 'Ошибка синхронизации'
        : 'Локальный режим';

  return (
    <div className="min-h-full bg-background px-4 iphone-safe-top pb-28">
      <header className="flex items-center gap-3 mb-7">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocation('/settings')}
          className="w-9 h-9 rounded-full bg-card/60 border border-white/[0.07] flex items-center justify-center text-muted-foreground"
        >
          <ChevronLeft size={20} />
        </motion.button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">CoffeeMind Cloud</p>
          <h1 className="font-serif text-[1.65rem] font-medium">Аккаунт</h1>
        </div>
      </header>

      {!configured ? (
        <div className="bg-card/60 border border-amber-500/20 rounded-[24px] p-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <CloudOff size={21} className="text-amber-400" />
          </div>
          <h2 className="font-serif text-xl mb-2">Supabase ещё не подключён</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Интерфейс аккаунта готов. Добавь URL проекта и publishable key в переменные окружения Vercel — после этого регистрация и облачная синхронизация включатся автоматически.
          </p>
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
                <p className="text-[11px] text-muted-foreground">Аккаунт CoffeeMind</p>
                <p className="font-medium truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-card/60 border border-white/[0.07] rounded-[24px] p-5">
            <div className="flex items-center gap-3 mb-2">
              {status === 'error' ? <CloudOff size={18} className="text-red-400" /> : <Cloud size={18} className="text-primary" />}
              <p className="font-medium">{statusLabel}</p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Дегустации, книги и профиль доступны на всех устройствах после входа в этот аккаунт.
            </p>
            {lastError && <p className="text-[12px] text-red-400 mt-3 break-words">{lastError}</p>}
          </div>

          <div className="bg-card/60 border border-white/[0.07] rounded-[24px] p-5 flex gap-3">
            <ShieldCheck size={19} className="text-emerald-400 mt-0.5" />
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Защита RLS разрешает пользователю читать и менять только собственные записи.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
            Выйти
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
                Войти
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                className={`flex-1 h-9 rounded-lg text-[13px] font-semibold transition-colors ${mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Регистрация
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] text-muted-foreground ml-1 mb-1.5 block">Имя</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к тебе обращаться" className="h-12 rounded-2xl bg-background" />
                </div>
              )}
              <div>
                <label className="text-[11px] text-muted-foreground ml-1 mb-1.5 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="name@example.com" className="h-12 rounded-2xl bg-background" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground ml-1 mb-1.5 block">Пароль</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Не менее 6 символов" className="h-12 rounded-2xl bg-background" />
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
                {mode === 'login' ? 'Войти и синхронизировать' : 'Создать аккаунт'}
              </motion.button>
            </form>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center px-5 leading-relaxed">
            При первом входе локальные дегустации и книги будут перенесены в облачный аккаунт.
          </p>
        </div>
      )}
    </div>
  );
}
