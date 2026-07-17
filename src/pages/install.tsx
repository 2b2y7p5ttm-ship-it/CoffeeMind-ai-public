import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  Chrome,
  Copy,
  Download,
  Home,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { isStandaloneApp } from '@/lib/registerPWA';
import { useSystemCopy } from '@/lib/systemI18n';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type DeviceType = 'ios' | 'android' | 'desktop';

function getDeviceType(): DeviceType {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'desktop';
}

function getInstallUrl() {
  return window.location.origin + window.location.pathname;
}

export default function Install() {
  const [, setLocation] = useLocation();
  const { copy } = useSystemCopy();
  const c = copy.install;
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
      setInstallMessage(c.copied);
    } catch {
      setInstallMessage(c.copyFallback);
    }
  };

  const installOnAndroid = async () => {
    if (!deferredPrompt) {
      setInstallMessage(c.noPrompt);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallMessage(choice.outcome === 'accepted' ? c.installing : c.dismissed);
  };

  const steps = device === 'ios' ? c.iosSteps : c.androidSteps;
  const stepIcons = device === 'ios'
    ? [<Share size={18} />, <PlusSquare size={18} />, <Home size={18} />]
    : [<Chrome size={18} />, <MoreVertical size={18} />, <Home size={18} />];

  return (
    <div className="min-h-full bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label={c.back}
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <Smartphone size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">{c.badge}</span>
          </div>
          <h1 className="font-serif text-[2.38rem] leading-[0.95] text-foreground mb-3">{c.title}</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">{c.subtitle}</p>
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
                <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold mb-2">{c.installedTitle}</p>
                <p className="text-[14px] text-foreground leading-relaxed">{c.installedText}</p>
              </div>
            </div>
          </section>
        ) : (
          <>
            {device === 'android' && (
              <section className="rounded-[28px] bg-primary/[0.09] border border-primary/20 p-5">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4">{c.quickAndroid}</p>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <Download size={19} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground mb-1">{c.installTitle}</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{c.installText}</p>
                  </div>
                </div>
                <button
                  onClick={installOnAndroid}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] font-bold flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  {c.installAndroid}
                </button>
              </section>
            )}

            <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4">
                {device === 'ios' ? c.iosInstruction : c.androidInstruction}
              </p>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <InstallStep
                    key={step.title}
                    number={String(index + 1)}
                    icon={stepIcons[index]}
                    title={step.title}
                    text={step.text}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {installMessage && (
          <section className="rounded-[24px] bg-white/[0.055] border border-white/[0.08] p-4 text-[13px] text-muted-foreground leading-relaxed" role="status">
            {installMessage}
          </section>
        )}

        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-4">{c.featuresTitle}</p>
          <div className="grid grid-cols-2 gap-3">
            {c.features.map((feature) => (
              <Feature key={feature.title} title={feature.title} text={feature.text} />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-primary flex-shrink-0">
              <WifiOff size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">{c.pwaLabel}</p>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{c.pwaText}</p>
            </div>
          </div>
        </section>

        <button
          onClick={copyUrl}
          className="w-full h-12 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2"
        >
          <Copy size={15} />
          {c.copyLink}
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
