import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, CheckCircle2, Lock, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'wouter';
import { useAchievements } from '@/hooks/useAchievements';
import type { AchievementCategory } from '@/lib/achievements';
import { useSectionCopy } from '@/lib/sectionI18n';

const CATEGORY_ORDER: Array<'all' | AchievementCategory> = [
  'all',
  'journey',
  'origins',
  'quality',
  'methods',
  'processing',
  'consistency',
  'sensory',
  'education',
];

export default function Achievements() {
  const { achievements, unlockedCount, totalCount, totalPoints, availablePoints } = useAchievements();
  const { copy, locale } = useSectionCopy();
  const [category, setCategory] = useState<'all' | AchievementCategory>('all');

  const filtered = useMemo(
    () => achievements.filter((item) => category === 'all' || item.category === category),
    [achievements, category],
  );

  const overallProgress = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-full px-4 iphone-safe-top pb-12">
      <header className="flex items-center gap-3 mb-6">
        <Link href="/profile">
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label={copy.achievements.back}
            className="w-10 h-10 rounded-full bg-card/70 border border-white/[0.07] grid place-items-center text-muted-foreground"
          >
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary">{copy.achievements.eyebrow}</p>
          <h1 className="font-serif text-3xl font-medium text-foreground leading-tight">{copy.achievements.title}</h1>
        </div>
      </header>

      <p className="text-[13px] leading-relaxed text-muted-foreground mb-5">{copy.achievements.subtitle}</p>

      <section className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.14] via-card/90 to-card/70 p-5 mb-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.06]">🏆</div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Trophy size={16} />
              <span className="text-[10px] uppercase tracking-[0.16em] font-extrabold">{copy.achievements.summaryTitle}</span>
            </div>
            <div className="flex items-end gap-2 mt-3">
              <span className="font-serif text-5xl leading-none text-foreground">{unlockedCount}</span>
              <span className="text-sm text-muted-foreground mb-1">/ {totalCount}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">{copy.achievements.unlocked}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 border border-primary/20 px-3 py-2 text-primary">
              <Award size={14} />
              <span className="font-bold text-sm">{totalPoints}</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-2">{copy.achievements.points}</p>
          </div>
        </div>

        <div className="relative mt-5">
          <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 24 }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{overallProgress}%</span>
            <span>{totalPoints} / {availablePoints} {copy.achievements.points}</span>
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORY_ORDER.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`flex-shrink-0 h-9 px-3.5 rounded-xl border text-[11px] font-semibold transition-colors ${
              category === item
                ? 'bg-primary/14 border-primary/35 text-primary'
                : 'bg-card/55 border-white/[0.06] text-muted-foreground'
            }`}
          >
            {item === 'all' ? copy.achievements.categoryAll : copy.achievements.categories[item]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((achievement, index) => {
          const itemCopy = copy.achievements.items[achievement.id];
          const progressPercent = Math.round(achievement.ratio * 100);
          const unlockedDate = achievement.unlockedAt
            ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(achievement.unlockedAt))
            : null;

          return (
            <motion.article
              key={achievement.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.035, 0.25) }}
              className={`relative overflow-hidden rounded-[24px] border p-4 ${
                achievement.unlocked
                  ? 'bg-card/80 border-primary/22 shadow-[0_16px_45px_rgba(0,0,0,0.08)]'
                  : 'bg-card/45 border-white/[0.05]'
              }`}
            >
              {achievement.unlocked && <div className="absolute inset-y-0 left-0 w-1 bg-primary" />}
              <div className="flex items-start gap-3">
                <div className={`w-[52px] h-[52px] min-w-[52px] rounded-2xl grid place-items-center text-2xl border ${
                  achievement.unlocked
                    ? 'bg-primary/12 border-primary/25'
                    : 'bg-muted/55 border-white/[0.04] grayscale opacity-55'
                }`}>
                  {achievement.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg font-semibold text-foreground leading-tight">{itemCopy.title}</h2>
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-1">{itemCopy.description}</p>
                    </div>
                    {achievement.unlocked
                      ? <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                      : <Lock size={15} className="text-muted-foreground/45 flex-shrink-0" />}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="text-muted-foreground">{copy.achievements.progress}</span>
                      <span className="font-bold text-foreground">{Math.min(achievement.current, achievement.target)} / {achievement.target}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${achievement.unlocked ? 'bg-primary' : 'bg-muted-foreground/35'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ type: 'spring', stiffness: 170, damping: 24, delay: 0.08 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-primary font-semibold">
                      <Sparkles size={12} />
                      +{achievement.rewardPoints} {copy.achievements.points}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 text-right">
                      {achievement.unlocked && unlockedDate
                        ? `${copy.achievements.earned}: ${unlockedDate}`
                        : copy.achievements.locked}
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
