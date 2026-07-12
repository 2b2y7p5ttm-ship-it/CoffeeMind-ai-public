import { Link, useLocation } from 'wouter';
import { Home, Dna, User, Plus, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Главная' },
  { href: '/stats', icon: Dna, label: 'DNA' },
  null,
  { href: '/books', icon: BookOpen, label: 'Книги' },
  { href: '/profile', icon: User, label: 'Профиль' },
];

export function BottomNav() {
  const [location] = useLocation();
  if (location === '/add' || location.startsWith('/tasting/') || location.startsWith('/coach/') || ['/settings','/install','/welcome','/share','/backup','/account','/admin'].includes(location)) return null;

  return (
    <div className="fixed inset-x-0 z-50 flex justify-center pointer-events-none iphone-bottom-nav">
      <div className="w-full max-w-[430px] px-3 pointer-events-auto">
        <div className="cm-bottom-nav iphone-nav-panel">
          <div className="grid grid-cols-5 items-center h-[64px] px-2">
            {NAV_ITEMS.map((item, index) => {
              if (!item) return (
                <div key="add" className="flex justify-center">
                  <Link href="/add">
                    <motion.div whileTap={{ scale: 0.88 }} whileHover={{ y: -2 }} className="cm-nav-fab">
                      <Plus size={25} strokeWidth={2.3} />
                    </motion.div>
                  </Link>
                </div>
              );
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div whileTap={{ scale: 0.86 }} className="relative flex flex-col items-center justify-center gap-1 py-2">
                    {active && <motion.div layoutId="nav-glow" className="absolute inset-x-2 inset-y-0 rounded-2xl bg-primary/10" transition={{ type:'spring', stiffness:420, damping:34 }} />}
                    <Icon size={21} strokeWidth={active ? 2.4 : 1.7} className={`relative z-10 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`relative z-10 text-[9px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
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
