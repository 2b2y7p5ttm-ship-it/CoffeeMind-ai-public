import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck2, Sparkles, X } from 'lucide-react';
import { Link } from 'wouter';
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { useSectionCopy } from '@/lib/sectionI18n';

export function WeeklyChallengeBridge() {
  const { pendingChallenge, markSeen } = useWeeklyChallenges({ track: true });
  const { copy } = useSectionCopy();

  useEffect(() => {
    if (!pendingChallenge) return;
    const timer = window.setTimeout(() => markSeen(pendingChallenge.instanceId), 5600);
    return () => window.clearTimeout(timer);
  }, [markSeen, pendingChallenge]);

  const itemCopy = pendingChallenge ? copy.challenges.items[pendingChallenge.id] : null;

  return (
    <AnimatePresence>
      {pendingChallenge && itemCopy && (
        <motion.div
          className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-[215] flex justify-center px-3 pointer-events-none"
          initial={{ opacity: 0, y: -28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 330, damping: 27 }}
        >
          <div className="relative w-full max-w-[404px] overflow-hidden rounded-[24px] border border-primary/30 bg-card/95 p-4 pr-12 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl pointer-events-auto">
            <div className="absolute -right-8 -top-10 text-[92px] opacity-[0.06]">{pendingChallenge.icon}</div>
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/14 border border-primary/25 grid place-items-center text-2xl">
                {pendingChallenge.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-primary">
                  <Sparkles size={13} />
                  <p className="text-[10px] uppercase tracking-[0.18em] font-extrabold">{copy.challenges.completedToast}</p>
                </div>
                <h2 className="font-serif text-lg font-semibold text-foreground mt-1 truncate">{itemCopy.title}</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">+{pendingChallenge.rewardPoints} {copy.challenges.points}</p>
              </div>
            </div>
            <div className="relative mt-3 flex justify-end">
              <Link href="/challenges">
                <button
                  onClick={() => markSeen(pendingChallenge.instanceId)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary"
                >
                  <CalendarCheck2 size={13} />
                  {copy.challenges.open}
                </button>
              </Link>
            </div>
            <button
              onClick={() => markSeen(pendingChallenge.instanceId)}
              aria-label={copy.challenges.close}
              className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/[0.05] grid place-items-center text-muted-foreground"
            >
              <X size={14} />
            </button>
            <motion.div
              className="absolute bottom-0 left-0 h-[3px] bg-primary"
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 5.6, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
