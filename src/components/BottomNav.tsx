import { Link, useLocation } from 'wouter';
import { Home, Dna, User, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useLanguage } from '@/contexts/LanguageContext';

const NAV_ITEMS = [
  // CoffeeMind stays tasting-first: Journal and Coffee DNA are the primary product areas.
  { href: '/', icon: Home, labelKey: 'nav.journal' as const },
  { href: '/stats', icon: Dna, labelKey: 'nav.dna' as const },
  { href: '/books', icon: BookOpen, labelKey: 'nav.books' as const },
  { href: '/learning', icon: GraduationCap, labelKey: 'nav.learning' as const },
  { href: '/profile', icon: User, labelKey: 'nav.profile' as const },
];

export function BottomNav() {
  const [location] = useLocation();
  const hidden = useScrollDirection();
  const { t } = useLanguage();
  if (location === '/add' || location.startsWith('/tasting/') || location.startsWith('/coach/') || location.startsWith('/learning/') || ['/settings','/install','/welcome','/share','/backup','/account','/admin','/achievements','/challenges','/exams'].includes(location)) return null;

  return (
    <motion.div
      initial={false}
      animate={{ y: hidden ? 118 : 0, opacity: hidden ? 0.25 : 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.75 }}
      className="fixed inset-x-0 z-50 flex justify-center pointer-events-none iphone-bottom-nav"
    >
      <div className="w-full max-w-[430px] px-3 pointer-events-auto">
        <div className="cm-bottom-nav iphone-nav-panel">
          <div className="grid grid-cols-5 items-center h-[64px] px-2">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} aria-label={t(item.labelKey)}>
                  <motion.div
                    whileTap={{ scale: 0.86 }}
                    className="relative flex min-w-0 flex-col items-center justify-center gap-1 py-2"
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-x-1.5 inset-y-0 rounded-2xl cm-nav-active"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <motion.div animate={{ y: active ? -1 : 0, scale: active ? 1.06 : 1 }}>
                      <Icon
                        size={21}
                        strokeWidth={active ? 2.4 : 1.7}
                        className={`relative z-10 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                    </motion.div>
                    <span className={`cm-nav-label relative z-10 font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                      {t(item.labelKey)}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
