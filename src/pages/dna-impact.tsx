import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import {
  ArrowRight,
  Brain,
  ChevronLeft,
  Coffee,
  Dna,
  Droplets,
  Globe2,
  Minus,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useTastings } from '@/hooks/useTastings';
import { useDnaImpactHistory } from '@/hooks/useDnaImpactHistory';
import {
  buildDnaImpactSnapshot,
  type DnaImpactMetric,
  type DnaImpactMetricKey,
  type DnaImpactSignal,
} from '@/lib/intelligence/dnaImpact';
import { getDnaImpactCopy } from '@/lib/dnaImpactI18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizeCountry } from '@/lib/coffeeReferenceI18n';
import { localizeProcessing } from '@/lib/processingI18n';
import { localizeBrewMethod } from '@/lib/brewMethodI18n';
import { localizeFlavor } from '@/lib/tastingI18n';

const SIGNAL_ICON = {
  country: Globe2,
  processing: Droplets,
  method: Coffee,
  flavor: Tag,
};

function metricMagnitude(metric: DnaImpactMetric) {
  return metric.key === 'diversity' ? Math.abs(metric.delta) / 10 : Math.abs(metric.delta);
}

function formatMetric(metric: DnaImpactMetric, value: number) {
  return metric.key === 'diversity' ? `${Math.round(value)}%` : value.toFixed(1);
}

function DeltaPill({ metric }: { metric: DnaImpactMetric }) {
  const delta = metric.delta;
  const Icon = delta > 0.005 ? TrendingUp : delta < -0.005 ? TrendingDown : Minus;
  const className = delta > 0.005
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    : delta < -0.005
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      : 'bg-muted text-muted-foreground';
  const suffix = metric.key === 'diversity' ? '%' : '';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${className}`}>
      <Icon size={11} />
      {delta > 0 ? '+' : ''}{delta.toFixed(metric.key === 'diversity' ? 0 : 2)}{suffix}
    </span>
  );
}

function localizeSignal(signal: DnaImpactSignal, language: 'ru' | 'en') {
  if (signal.kind === 'country') return localizeCountry(signal.value, language);
  if (signal.kind === 'processing') return localizeProcessing(signal.value, language);
  if (signal.kind === 'method') return localizeBrewMethod(signal.value, language);
  return localizeFlavor(signal.value, language);
}

export default function DnaImpactPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { tastings, getTasting } = useTastings();
  const { getImpact } = useDnaImpactHistory();
  const c = getDnaImpactCopy(language);
  const tasting = getTasting(id || '');

  const snapshot = useMemo(() => {
    if (!tasting) return null;
    return getImpact(tasting.id) || buildDnaImpactSnapshot(
      tastings.filter((item) => item.id !== tasting.id),
      tasting,
      language,
    );
  }, [getImpact, language, tasting, tastings]);

  if (!tasting || !snapshot) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <Dna size={38} className="text-primary" />
        <h1 className="mt-4 font-serif text-2xl">Coffee DNA</h1>
        <button onClick={() => setLocation('/')} className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          {c.journal}
        </button>
      </div>
    );
  }

  const isFirst = snapshot.beforeTastingCount === 0;
  const relevantMetrics = [...snapshot.metrics]
    .sort((a, b) => metricMagnitude(b) - metricMagnitude(a))
    .slice(0, 4);
  const strongest = snapshot.metrics.find((metric) => metric.key === snapshot.strongestMetric) || relevantMetrics[0];
  const archetypeChanged = snapshot.beforeArchetypeId && snapshot.beforeArchetypeId !== snapshot.afterArchetypeId;

  const metricLabels: Record<DnaImpactMetricKey, string> = c.metrics;

  return (
    <div className="min-h-[100dvh] bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          type="button"
          onClick={() => setLocation(`/tasting/${tasting.id}`)}
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground"
          aria-label={c.journal}
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
            <Sparkles size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">{c.eyebrow}</span>
          </div>
          <h1 className="font-serif text-[2.3rem] leading-[0.96] text-foreground">
            {isFirst ? c.firstTitle : c.title}
          </h1>
          <p className="mt-3 max-w-sm text-[13px] leading-5 text-muted-foreground">
            {isFirst ? c.firstSubtitle : c.subtitle}
          </p>
        </motion.div>
      </header>

      <main className="space-y-4 px-4">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative overflow-hidden rounded-[30px] border border-primary/20 bg-gradient-to-br from-primary/[0.16] via-card to-card p-5"
        >
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-primary/75">{tasting.coffeeName}</p>
                <h2 className="mt-2 font-serif text-2xl text-foreground">{c.strongestChange}</h2>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Dna size={23} />
              </div>
            </div>

            {strongest && (
              <div className="mt-5 rounded-[22px] border border-white/10 bg-background/45 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold text-foreground">{metricLabels[strongest.key]}</p>
                  {isFirst ? (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{c.firstSignal}</span>
                  ) : (
                    <DeltaPill metric={strongest} />
                  )}
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{c.profileBefore}</p>
                    <p className="mt-1 font-serif text-2xl text-foreground/55">{isFirst ? '—' : formatMetric(strongest, strongest.before)}</p>
                  </div>
                  <ArrowRight size={18} className="text-primary" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{c.profileAfter}</p>
                    <p className="mt-1 font-serif text-2xl text-primary">{formatMetric(strongest, strongest.after)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Coffee size={14} className="text-primary" />
              <span>{snapshot.afterTastingCount} {c.cups}</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="grid grid-cols-2 gap-3"
        >
          {relevantMetrics.map((metric) => (
            <article key={metric.key} className="rounded-[22px] border border-border bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{metricLabels[metric.key]}</p>
              <div className="mt-3 flex items-end justify-between gap-2">
                <p className="font-serif text-xl text-foreground">{formatMetric(metric, metric.after)}</p>
                {isFirst ? (
                  <span className="text-[9px] font-semibold text-primary">{c.firstSignal}</span>
                ) : (
                  <DeltaPill metric={metric} />
                )}
              </div>
            </article>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[28px] border border-border bg-card p-5"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles size={17} />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">{c.cupContribution}</h2>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{c.cupContributionHint}</p>
            </div>
          </div>

          <div className="grid gap-2.5">
            {snapshot.signals.slice(0, 7).map((signal) => {
              const Icon = SIGNAL_ICON[signal.kind];
              return (
                <div key={signal.id} className="flex items-center gap-3 rounded-[19px] border border-border bg-background/55 px-3.5 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{c.signalKinds[signal.kind]}</p>
                    <p className="mt-0.5 truncate text-[13px] font-medium text-foreground">{localizeSignal(signal, language)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${signal.isNew ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {signal.isNew ? c.newSignal : c.reinforced}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[24px] border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Brain size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {archetypeChanged ? c.archetypeChanged : c.archetypeStable}
              </p>
              <p className="mt-1 truncate font-serif text-lg text-foreground">{c.archetypes[snapshot.afterArchetypeId]}</p>
            </div>
          </div>
        </motion.section>

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => setLocation('/stats')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Dna size={17} />{c.openDna}
          </button>
          <button
            type="button"
            onClick={() => setLocation(`/coach/${tasting.id}`)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-semibold text-foreground"
          >
            <Brain size={17} />{c.openCoach}
          </button>
          <button
            type="button"
            onClick={() => setLocation('/')}
            className="h-11 w-full text-[12px] font-semibold text-muted-foreground"
          >
            {c.journal}
          </button>
        </div>
      </main>
    </div>
  );
}
