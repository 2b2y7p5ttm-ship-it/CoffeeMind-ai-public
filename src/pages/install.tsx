import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Share, PlusSquare, Smartphone, WifiOff, CheckCircle2, Copy, Home, Download, Chrome, MoreVertical } from 'lucide-react';
import { useLocation } from 'wouter';
import { isStandaloneApp } from '@/lib/registerPWA';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function getDeviceType() {
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

function getInstallUrl() {
  return window.location.origin + window.location.pathname;
}

export default function Install() {
  const [, setLocation] = useLocation();
  const standalone = isStandaloneApp();
  const device = useMemo(() => getDeviceType(), []);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const installUrl = getInstallUrl();

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(installUrl);
      setInstallMessage('Ссылка скопирована. Открой ее в Chrome на Android или Safari на iPhone.');
    } catch {
      setInstallMessage('Скопируй адрес из строки браузера и отправь его пользователю.');
    }
  };

  const installOnAndroid = async () => {
    if (!deferredPrompt) {
      setInstallMessage('Если кнопка установки не появилась, открой меню Chrome ⋮ и выбери “Установить приложение” или “Добавить на главный экран”.');
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallMessage(choice.outcome === 'accepted' ? 'CoffeeMind устанавливается как приложение.' : 'Установку можно повторить позже через это окно.');
  };

  return (
    <div className="min-h-full bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label="Назад"
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <Smartphone size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Android · iPhone · PWA</span>
          </div>
          <h1 className="font-serif text-[2.38rem] leading-[0.95] text-foreground mb-3">CoffeeMind как приложение на телефоне</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">
            Установи CoffeeMind AI на главный экран: приложение откроется без лишнего интерфейса браузера, сохранит личный журнал локально и будет работать как PWA.
          </p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        {standalone ? (
          <section className="rounded-[28px] bg-emerald-500/[0.08] border border-emerald-400/20 p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold mb-2">Уже установлено</p>
                <p className="text-[14px] text-foreground leading-relaxed">
                  Сейчас CoffeeMind запущен в режиме приложения. Данные дегустаций и книг продолжают храниться на этом устройстве.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <>
            {device === 'android' && (
              <section className="rounded-[28px] bg-primary/[0.09] border border-primary/20 p-5">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4">Быстрая установка на Android</p>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <Download size={19} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground mb-1">Установить CoffeeMind</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      В Chrome на Android может появиться системное окно установки. Если оно не появилось, используй ручную инструкцию ниже.
                    </p>
                  </div>
                </div>
                <button
                  onClick={installOnAndroid}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] font-bold flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Установить на Android
                </button>
              </section>
            )}

            <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4">
                {device === 'ios' ? 'Инструкция для iPhone' : 'Инструкция для Android'}
              </p>
              <div className="space-y-3">
                {device === 'ios' ? (
                  <>
                    <InstallStep
                      number="1"
                      icon={<Share size={18} />}
                      title="Нажми Поделиться"
                      text="В Safari нажми значок квадрата со стрелкой вверх. Он находится внизу или сверху, в зависимости от режима браузера."
                    />
                    <InstallStep
                      number="2"
                      icon={<PlusSquare size={18} />}
                      title="Выбери “На экран Домой”"
                      text="Прокрути меню Safari вниз и нажми “На экран Домой”. Название должно быть CoffeeMind AI."
                    />
                    <InstallStep
                      number="3"
                      icon={<Home size={18} />}
                      title="Открой как приложение"
                      text="На домашнем экране появится иконка CoffeeMind. Открывай ее как обычное iPhone-приложение."
                    />
                  </>
                ) : (
                  <>
                    <InstallStep
                      number="1"
                      icon={<Chrome size={18} />}
                      title="Открой ссылку в Chrome"
                      text="Лучше всего установка работает в Chrome на Android. Samsung Internet и Edge тоже могут поддерживать установку PWA."
                    />
                    <InstallStep
                      number="2"
                      icon={<MoreVertical size={18} />}
                      title="Открой меню ⋮"
                      text="Нажми три точки в правом верхнем углу браузера и выбери “Установить приложение” или “Добавить на главный экран”."
                    />
                    <InstallStep
                      number="3"
                      icon={<Home size={18} />}
                      title="Запусти с главного экрана"
                      text="CoffeeMind появится как отдельная иконка. У каждого пользователя будет свой локальный журнал дегустаций и книг."
                    />
                  </>
                )}
              </div>
            </section>
          </>
        )}

        {installMessage && (
          <section className="rounded-[24px] bg-white/[0.055] border border-white/[0.08] p-4 text-[13px] text-muted-foreground leading-relaxed">
            {installMessage}
          </section>
        )}

        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-4">Что будет работать</p>
          <div className="grid grid-cols-2 gap-3">
            <Feature title="Журнал" text="Кофейные записи на телефоне" />
            <Feature title="AI Coach" text="Разбор после сохранения" />
            <Feature title="Taste DNA" text="Профиль вкуса по дескрипторам" />
            <Feature title="Книги" text="Оценки книг и пары с кофе" />
          </div>
        </section>

        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-primary flex-shrink-0">
              <WifiOff size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">PWA shell</p>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Добавлен service worker: базовая оболочка приложения кэшируется. Для надежного шаринга другим людям приложение лучше публиковать по HTTPS-ссылке через Vercel, Netlify или GitHub Pages.
              </p>
            </div>
          </div>
        </section>

        <button
          onClick={copyUrl}
          className="w-full h-12 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2"
        >
          <Copy size={15} />
          Скопировать ссылку приложения
        </button>
      </main>
    </div>
  );
}

function InstallStep({ number, icon, title, text }: { number: string; icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[22px] bg-background/60 border border-white/[0.06] p-4 flex gap-3">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {number}
        </div>
      </div>
      <div>
        <h3 className="text-[14px] font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[20px] bg-background/60 border border-white/[0.06] p-4">
      <p className="text-[13px] font-semibold text-foreground mb-1">{title}</p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
