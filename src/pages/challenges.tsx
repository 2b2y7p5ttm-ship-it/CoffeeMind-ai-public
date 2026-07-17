import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Coins,
  Gift,
  History,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { Link } from 'wouter';
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { fillSectionCopy, useSectionCopy } from '@/lib/sectionI18n';
import type { WeeklyChallengeId } from '@/lib/weeklyChallenges';

function formatWeekLabel(weekKey: string, locale: string): string {
  const start = new Date(`${weekKey}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  return `${formatter.format(start)} — ${formatter.format(end)}`;
}

export default function Challenges() {
  const {
    dailyChallenge,
    weeklyChallenges,
    weeklyCompleted,
    currentWeekPoints,
    totalPoints,
    daysLeft,
    history,
    claimReward,
  } = useWeeklyChallenges({ track: true });
  const { copy, locale } = useSectionCopy();
  const c = copy.challenges;
  const [historyOpen, setHistoryOpen] = useState(false);
  const [claimedNow, setClaimedNow] = useState<string | null>(null);

  const weekProgress = weeklyChallenges.length
    ? Math.round((weeklyCompleted / weeklyChallenges.length) * 100)
    : 0;
  const unclaimedCount = [dailyChallenge, ...weeklyChallenges]
    .filter(Boolean)
    .filter((challenge) => challenge?.completed && !challenge.claimedAt).length;

  const handleClaim = (instanceId: string) => {
    claimReward(instanceId);
    setClaimedNow(instanceId);
    window.setTimeout(() => setClaimedNow((current) => current === instanceId ? null : current), 1300);
  };

  const itemCopy = (id: WeeklyChallengeId) => c.items[id];

  const historyItems = useMemo(
    () => history.filter((item) => item.weekKey !== weeklyChallenges[0]?.weekKey),
    [history, weeklyChallenges],
  );

  const renderChallenge = (challenge: NonNullable<typeof dailyChallenge>, featured = false) => {
    const text = itemCopy(challenge.id);
    const claimed = Boolean(challenge.claimedAt);
    const justClaimed = claimedNow === challenge.instanceId;

    return (
      <motion.article
        key={challenge.instanceId}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-[26px] border p-4 ${
          featured
            ? 'bg-gradient-to-br from-primary/[0.14] via-card/85 to-card/70 border-primary/24'
            : challenge.completed
              ? 'bg-primary/[0.06] border-primary/18'
              : 'bg-card/65 border-white/[0.06]'
        }`}
      >
        <div className="absolute -right-4 -top-6 text-[74px] opacity-[0.055]">{challenge.icon}</div>
        <div className="relative flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl grid place-items-center text-2xl flex-shrink-0 ${
            challenge.completed
              ? 'bg-primary/14 border border-primary/24'
              : 'bg-background/55 border border-white/[0.06]'
          }`}>
            {challenge.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-serif text-lg font-semibold text-foreground leading-tight">{text.title}</p>
              {challenge.completed && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/12 border border-emerald-500/22 grid place-items-center flex-shrink-0">
                  <Check size={14} className="text-emerald-400" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
              {fillSectionCopy(text.description, { target: challenge.target })}
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span className="text-muted-foreground">{c.progress}</span>
            <span className={challenge.completed ? 'text-primary font-bold' : 'text-foreground font-semibold'}>
              {Math.min(challenge.current, challenge.target)} / {challenge.target}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/65 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${challenge.ratio * 100}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-between gap-3 mt-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Coins size={13} className="text-primary" />
            +{challenge.rewardPoints} {c.points}
          </span>
          {challenge.completed ? (
            claimed ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 size={13} />
                {justClaimed ? c.claimedNow : c.claimed}
              </span>
            ) : (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleClaim(challenge.instanceId)}
                className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-[11px] font-bold inline-flex items-center gap-1.5"
              >
                <Gift size={13} />
                {c.claim}
              </motion.button>
            )
          ) : (
            <span className="text-[10px] text-muted-foreground/60">{c.inProgress}</span>
          )}
        </div>
      </motion.article>
    );
  };

  return (
    <div className="min-h-full px-4 iphone-safe-top pb-12">
      <header className="flex items-center gap-3 mb-5">
        <Link href="/profile">
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label={c.back}
            className="w-10 h-10 rounded-full bg-card/70 border border-white/[0.07] grid place-items-center text-muted-foreground"
          >
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary">{c.eyebrow}</p>
          <h1 className="font-serif text-3xl font-medium text-foreground leading-tight">{c.title}</h1>
        </div>
      </header>

      <p className="text-[13px] leading-relaxed text-muted-foreground mb-5">{c.subtitle}</p>

      <section className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.15] via-card/90 to-card/70 p-5 mb-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.06]">🎯</div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Target size={16} />
              <span className="text-[10px] uppercase tracking-[0.16em] font-extrabold">{c.weekSummary}</span>
            </div>
            <div className="flex items-end gap-2 mt-3">
              <span className="font-serif text-5xl leading-none text-foreground">{weeklyCompleted}</span>
              <span className="text-sm text-muted-foreground mb-1">/ {weeklyChallenges.length}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {fillSectionCopy(c.daysLeft, { count: daysLeft })}
            </p>
          </div>
          <div className="text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 border border-primary/20 px-3 py-2 text-primary">
              <Coins size={14} />
              <span className="font-bold text-sm">{currentWeekPoints}</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60">{c.thisWeekPoints}</p>
          </div>
        </div>
        <div className="relative mt-5">
          <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${weekProgress}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 24 }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{weekProgress}%</span>
            <span>{unclaimedCount > 0 ? fillSectionCopy(c.rewardsWaiting, { count: unclaimedCount }) : c.allClaimed}</span>
          </div>
        </div>
      </section>

      {dailyChallenge && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <CalendarDays size={15} className="text-primary" />
            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground/65">{c.dailyTitle}</p>
          </div>
          {renderChallenge(dailyChallenge, true)}
        </section>
      )}

      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Trophy size={15} className="text-primary" />
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground/65">{c.weeklyTitle}</p>
        </div>
        <div className="space-y-3">
          {weeklyChallenges.map((challenge) => renderChallenge(challenge))}
        </div>
      </section>

      <section className="rounded-[26px] bg-card/55 border border-white/[0.06] overflow-hidden mb-5">
        <button
          onClick={() => setHistoryOpen((value) => !value)}
          className="w-full flex items-center justify-between gap-3 p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/18 grid place-items-center">
              <History size={17} className="text-primary" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">{c.historyTitle}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{fillSectionCopy(c.totalPoints, { count: totalPoints })}</p>
            </div>
          </div>
          <motion.div animate={{ rotate: historyOpen ? 180 : 0 }}>
            <ChevronDown size={18} className="text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {historyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {historyItems.length ? historyItems.map((item) => (
                  <div key={item.weekKey} className="flex items-center justify-between gap-3 rounded-2xl bg-background/50 border border-white/[0.04] px-4 py-3">
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">{formatWeekLabel(item.weekKey, locale)}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {fillSectionCopy(c.historyCompleted, { count: item.completedCount })}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                      <Coins size={13} />
                      {item.earnedPoints}
                    </span>
                  </div>
                )) : (
                  <p className="text-[11px] text-muted-foreground text-center py-5">{c.historyEmpty}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="rounded-[24px] border border-primary/16 bg-primary/[0.055] p-4 flex gap-3">
        <Sparkles size={17} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">{c.footerNote}</p>
      </section>
    </div>
  );
}
