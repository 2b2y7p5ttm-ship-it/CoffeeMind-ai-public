import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronLeft, Cloud, Coffee, LogIn, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

function Benefit({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-[22px] bg-card/72 border border-border/70 p-4 flex gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-2xl bg-primary/12 border border-primary/18 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const continueWithoutAccount = () => {
    localStorage.setItem('coffeemind_welcome_seen', 'true');
    setLocation('/add');
  };

  return (
    <div className="min-h-full bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/')}
          className="w-10 h-10 mb-5 rounded-full bg-card/80 border border-border/70 flex items-center justify-center text-muted-foreground shadow-sm"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <Sparkles size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">CoffeeMind</span>
          </div>
          <h1 className="font-serif text-[2.55rem] leading-[0.95] text-foreground mb-4">{t('welcome.hero')}</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed max-w-[360px]">{t('welcome.subtitle')}</p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="rounded-[30px] bg-primary/[0.09] border border-primary/20 p-5 overflow-hidden relative"
        >
          <div className="absolute -right-12 -top-16 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="grid grid-cols-3 gap-3 mb-5 relative">
            <div className="rounded-[20px] bg-background/70 border border-border/60 p-4 text-center">
              <Coffee size={22} className="text-primary mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('welcome.coffee')}</p>
            </div>
            <div className="rounded-[20px] bg-background/70 border border-border/60 p-4 text-center">
              <BookOpen size={22} className="text-primary mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('welcome.books')}</p>
            </div>
            <div className="rounded-[20px] bg-background/70 border border-border/60 p-4 text-center">
              <Sparkles size={22} className="text-primary mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">DNA</p>
            </div>
          </div>
          <p className="text-[14px] text-foreground leading-relaxed relative">{t('welcome.accountText')}</p>
        </motion.section>

        <Benefit icon={Cloud} title={t('welcome.syncTitle')} text={t('welcome.syncText')} />
        <Benefit icon={ShieldCheck} title={t('welcome.privacyTitle')} text={t('welcome.privacyText')} />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          className="pt-2 space-y-3"
        >
          {user ? (
            <button
              onClick={() => setLocation('/')}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(217,163,95,0.24)]"
            >
              {t('welcome.goJournal')}
              <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <Link href="/account?mode=signup&from=welcome">
                <button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(217,163,95,0.24)]">
                  <UserPlus size={18} />
                  {t('welcome.createAccount')}
                </button>
              </Link>
              <Link href="/account?mode=login&from=welcome">
                <button className="w-full h-13 rounded-2xl bg-card border border-border/80 text-foreground text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm">
                  <LogIn size={17} />
                  {t('welcome.signIn')}
                </button>
              </Link>
              <button
                onClick={continueWithoutAccount}
                className="w-full min-h-11 px-4 rounded-2xl text-muted-foreground text-[13px] font-semibold"
              >
                {t('welcome.continueGuest')}
              </button>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
