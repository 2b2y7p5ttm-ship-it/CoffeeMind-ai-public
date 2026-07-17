import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Dna, User, Plus, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddActionSheet } from '@/components/AddActionSheet';

const NAV_ITEMS = [
  { href: '/', icon: Home, labelKey: 'nav.journal' as const },
  { href: '/add', icon: Plus, labelKey: 'nav.add' as const, shortLabel: true },
  { href: '/stats', icon: Dna, labelKey: 'nav.dna' as const, primary: true },
  { href: '/books', icon: BookOpen, labelKey: 'nav.books' as const },
  { href: '/profile', icon: User, labelKey: 'nav.profile' as const },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const hidden = useScrollDirection();
  const { t } = useLanguage();

  useEffect(() => {
    setAddSheetOpen(false);
  }, [location]);

  const closeAddSheet = useCallback(() => setAddSheetOpen(false), []);

  const addTasting = useCallback(() => {
    setAddSheetOpen(false);
    setLocation('/add');
  }, [setLocation]);

  const addBook = useCallback(() => {
    setAddSheetOpen(false);
    window.sessionStorage.setItem('coffeemind:open-book-form', '1');

    if (location.startsWith('/books')) {
      window.dispatchEvent(new CustomEvent('coffeemind:open-book-form'));
      return;
    }

    setLocation('/books');
  }, [location, setLocation]);

  if (
    location === '/add' ||
    location.startsWith('/tasting/') ||
    location.startsWith('/coach/') ||
    location.startsWith('/learning') ||
    [
      '/settings',
      '/install',
      '/welcome',
      '/share',
      '/backup',
      '/account',
      '/admin',
      '/achievements',
      '/challenges',
      '/exams',
    ].includes(location)
  ) {
    return null;
  }

  return (
    <motion.div
      initial={false}
      animate={{ y: hidden ? 118 : 0, opacity: hidden ? 0.25 : 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.75 }}
      className="fixed inset-x-0 z-50 flex justify-center pointer-events-none iphone-bottom-nav"
    >
      <div className="w-full max-w-[430px] px-3 pointer-events-auto">
        <div className="cm-bottom-nav iphone-nav-panel">
          <div className="grid h-[64px] grid-cols-5 items-center px-2">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              const Icon = item.icon;
              const fullLabel = t(item.labelKey);
              const visibleLabel = item.shortLabel ? fullLabel.split(' ')[0] : fullLabel;

              if (item.primary) {
                return (
                  <Link key={item.href} href={item.href} aria-label={fullLabel}>
                    <motion.div
                      whileTap={{ scale: 0.88 }}
                      className="relative flex h-[64px] min-w-0 flex-col items-center justify-center"
                    >
                      <motion.div
                        animate={{ y: active ? -3 : 0, scale: active ? 1.04 : 1 }}
                        className="cm-nav-fab relative"
                      >
                        <Icon size={25} strokeWidth={active ? 2.5 : 2.15} />
                      </motion.div>
                      <span className="cm-nav-label absolute bottom-1 z-10 font-bold text-primary">
                        {visibleLabel}
                      </span>
                    </motion.div>
                  </Link>
                );
              }

              const content = (
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
                      className={`relative z-10 transition-colors ${
                        active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`cm-nav-label relative z-10 font-semibold ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {visibleLabel}
                  </span>
                </motion.div>
              );

              if (item.href === '/add') {
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => setAddSheetOpen(true)}
                    aria-label={fullLabel}
                    aria-haspopup="dialog"
                    aria-expanded={addSheetOpen}
                    className="min-w-0"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link key={item.href} href={item.href} aria-label={fullLabel}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <AddActionSheet
        open={addSheetOpen}
        onClose={closeAddSheet}
        onAddTasting={addTasting}
        onAddBook={addBook}
      />
    </motion.div>
  );
}
