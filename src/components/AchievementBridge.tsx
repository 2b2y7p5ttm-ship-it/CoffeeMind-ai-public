import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Sparkles, X } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { useSectionCopy } from '@/lib/sectionI18n';

export function AchievementBridge() {
  const { pendingAchievement, markSeen } = useAchievements({ track: true });
  const { copy } = useSectionCopy();

  useEffect(() => {
    if (!pendingAchievement) return;
    const timer = window.setTimeout(() => markSeen(pendingAchievement.id), 5200);
    return () => window.clearTimeout(timer);
  }, [markSeen, pendingAchievement]);

  const itemCopy = pendingAchievement ? copy.achievements.items[pendingAchievement.id] : null;

  return (
    <AnimatePresence>
      {pendingAchievement && itemCopy && (
        <motion.div
          className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-[220] flex justify-center px-3 pointer-events-none"
          initial={{ opacity: 0, y: -26, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 330, damping: 27 }}
        >
          <div className="relative w-full max-w-[404px] overflow-hidden rounded-[24px] border border-primary/30 bg-card/95 p-4 pr-12 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl pointer-events-auto">
            <div className="absolute -right-8 -top-10 text-[92px] opacity-[0.06]">{pendingAchievement.icon}</div>
            <div className="flex items-center gap-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/14 border border-primary/25 grid place-items-center text-2xl shadow-[0_0_32px_hsl(var(--primary)/.18)]">
                {pendingAchievement.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-primary">
                  <Sparkles size={13} />
                  <p className="text-[10px] uppercase tracking-[0.18em] font-extrabold">{copy.achievements.newUnlocked}</p>
                </div>
                <h2 className="font-serif text-lg font-semibold text-foreground mt-1 truncate">{itemCopy.title}</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{itemCopy.description}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 relative">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <Award size={12} className="text-primary" />
                +{pendingAchievement.rewardPoints} {copy.achievements.points}
              </span>
              <span className="text-[9px] text-muted-foreground/60">{copy.achievements.newUnlockedHint}</span>
            </div>
            <button
              onClick={() => markSeen(pendingAchievement.id)}
              aria-label={copy.achievements.close}
              className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/[0.05] grid place-items-center text-muted-foreground"
            >
              <X size={14} />
            </button>
            <motion.div
              className="absolute bottom-0 left-0 h-[3px] bg-primary"
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 5.2, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
