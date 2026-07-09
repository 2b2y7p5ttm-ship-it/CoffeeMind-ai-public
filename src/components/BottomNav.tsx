import { Link, useLocation } from 'wouter';
import { Home, BarChart2, User, Plus, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Журнал' },
  { href: '/stats', icon: BarChart2, label: 'Аналитика' },
  null, // FAB placeholder
  { href: '/books', icon: BookOpen, label: 'Книги' },
  { href: '/profile', icon: User, label: 'Профиль' },
];

export function BottomNav() {
  const [location] = useLocation();

  if (location === '/add' || location.startsWith('/tasting/') || location.startsWith('/coach/') || location === '/settings' || location === '/install' || location === '/welcome' || location === '/share' || location === '/backup') return null;

  return (
    <div className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none iphone-bottom-nav">
      <div className="w-full max-w-[430px] pointer-events-auto">
        {/* Glass bar */}
        <div className="mx-3 rounded-[26px] bg-black/86 backdrop-blur-2xl border border-white/[0.08] shadow-[0_-18px_50px_rgba(0,0,0,0.45)] iphone-nav-panel">
          <div className="flex items-center justify-around px-2 pt-2 pb-2 relative h-[60px]">
            {NAV_ITEMS.map((item, i) => {
              if (!item) {
                // FAB
                return (
                  <div key="fab" className="relative -top-5">
                    <Link href="/add" data-testid="nav-add">
                      <motion.div
                        whileTap={{ scale: 0.92 }}
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_24px_rgba(217,163,95,0.38),0_4px_16px_rgba(0,0,0,0.55)] ring-4 ring-background"
                      >
                        <Plus size={26} strokeWidth={2.5} className="text-primary-foreground" />
                      </motion.div>
                    </Link>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = item.href === '/' ? location === '/' : location.startsWith(item.href);

              return (
                <Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase()}`}>
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className="flex flex-col items-center gap-1 px-2.5 py-1"
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-white/35'}`}
                    />
                    <span
                      className={`text-[9px] font-semibold tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-primary' : 'text-white/25'}`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute top-0 w-8 h-0.5 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
