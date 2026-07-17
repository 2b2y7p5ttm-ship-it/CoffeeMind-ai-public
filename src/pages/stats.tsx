import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowRight,
  ChevronRight,
  Coffee,
  Compass,
  Dna,
  Droplets,
  Eye,
  FlaskConical,
  Globe2,
  History,
  Layers3,
  MapPin,
  Minus,
  Plus,
  Route,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useTastings } from '@/hooks/useTastings';
import { buildTasteProfile } from '@/lib/intelligence/tasteProfile';
import { generateTasteInsights } from '@/lib/intelligence/insights';
import {
  buildDnaComparison,
  buildExplorationGaps,
  buildInfluentialTastings,
  buildNextCoffeeRecommendation,
  type DnaMetricDelta,
  type DnaMetricKey,
  type DnaPeriod,
} from '@/lib/intelligence/dnaEvolution';
import { getDnaCopy } from '@/lib/dnaI18n';
import { flavorChipStyle } from '@/lib/coffeeUtils';
import { localizeFlavor } from '@/lib/tastingI18n';
import { localizeProcessing } from '@/lib/processingI18n';
import { localizeBrewMethod } from '@/lib/brewMethodI18n';
import { localizeCountry } from '@/lib/coffeeReferenceI18n';
import { fillSectionCopy, useSectionCopy } from '@/lib/sectionI18n';

const TONE_CLASS = {
  gold: 'border-amber-400/15 bg-amber-400/[0.06]',
  berry: 'border-fuchsia-400/15 bg-fuchsia-400/[0.06]',
  blue: 'border-sky-400/15 bg-sky-400/[0.06]',
  green: 'border-emerald-400/15 bg-emerald-400/[0.06]',
};

const GAP_ICON = {
  country: Globe2,
  processing: FlaskConical,
  method: Coffee,
  flavor: Sparkles,
};

const reveal = {
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value * 10)}%` }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-full bg-gradient-to-r from-primary/55 to-primary"
        />
      </div>
    </div>
  );
}

function DeltaBadge({ delta, suffix = '' }: { delta: number; suffix?: string }) {
  const Icon = delta > 0.05 ? TrendingUp : delta < -0.05 ? TrendingDown : Minus;
  const className = delta > 0.05
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    : delta < -0.05
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      : 'bg-muted text-muted-foreground';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${className}`}>
      <Icon size={11} />
      {delta > 0 ? '+' : ''}{delta.toFixed(1)}{suffix}
    </span>
  );
}

function SectionHeading({ icon: Icon, title, description }: { icon: typeof Dna; title: string; description?: string }) {
  return (
    <div className="mb-3 flex items-start gap-2.5 px-1">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
        <Icon size={15} />
      </div>
      <div>
        <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function metricLabel(key: DnaMetricKey, labels: Record<DnaMetricKey, string>): string {
  return labels[key];
}

export default function Stats() {
  const { tastings } = useTastings();
  const { copy, language } = useSectionCopy();
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState<DnaPeriod>('all');
  const statsCopy = copy.stats;
  const dnaCopy = getDnaCopy(language);

  const comparison = useMemo(() => buildDnaComparison(tastings, period, language), [tastings, period, language]);
  const profile = useMemo(() => buildTasteProfile(comparison.activeTastings, language), [comparison.activeTastings, language]);
  const insights = useMemo(() => generateTasteInsights(comparison.activeTastings, profile, language), [comparison.activeTastings, profile, language]);
  const influential = useMemo(() => buildInfluentialTastings(comparison.activeTastings, profile, language), [comparison.activeTastings, profile, language]);
  const explorationGaps = useMemo(() => buildExplorationGaps(comparison.activeTastings, profile, language), [comparison.activeTastings, profile, language]);
  const recommendation = useMemo(() => buildNextCoffeeRecommendation(comparison.activeTastings, profile, language), [comparison.activeTastings, profile, language]);

  const radar = [
    { name: statsCopy.acidity, value: profile.averages.acidity, previous: comparison.previousProfile?.averages.acidity },
    { name: statsCopy.sweetness, value: profile.averages.sweetness, previous: comparison.previousProfile?.averages.sweetness },
    { name: statsCopy.body, value: profile.averages.body, previous: comparison.previousProfile?.averages.body },
    { name: statsCopy.aftertaste, value: profile.averages.aftertaste, previous: comparison.previousProfile?.averages.aftertaste },
    { name: statsCopy.balance, value: profile.averages.balance, previous: comparison.previousProfile?.averages.balance },
  ];

  const metricLabels: Record<DnaMetricKey, string> = {
    acidity: dnaCopy.acidity,
    sweetness: dnaCopy.sweetness,
    body: dnaCopy.body,
    aftertaste: dnaCopy.aftertaste,
    balance: dnaCopy.balance,
    overallScore: dnaCopy.overallScore,
    diversity: dnaCopy.diversity,
  };

  const mostRelevantDeltas = useMemo(() => {
    return [...comparison.deltas]
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 4);
  }, [comparison.deltas]);

  if (!tastings.length) {
    return (
      <div className="flex min-h-[100dvh] flex-col justify-center px-6 pb-28 text-center iphone-safe-top">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-primary/15 bg-primary/10">
          <Dna className="text-primary" size={34} />
        </div>
        <h1 className="font-serif text-3xl text-foreground">Coffee DNA</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{statsCopy.emptyText}</p>
        <button onClick={() => setLocation('/add')} className="mx-auto mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
          <Plus size={17} />{dnaCopy.addTasting}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-5 px-4 pb-28 iphone-safe-top">
      <header className="flex items-end justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/70">{statsCopy.eyebrow}</p>
          <h1 className="font-serif text-[2.05rem] leading-none text-foreground">Coffee DNA</h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-primary"><AnimatedNumber value={profile.sampleSize} /></p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.cups}</p>
        </div>
      </header>

      <div className="cm-dna-period-switch" role="tablist" aria-label={language === 'ru' ? 'Период анализа' : 'Analysis period'}>
        {(['all', '90d', '30d'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={period === value}
            onClick={() => setPeriod(value)}
            className={period === value ? 'is-active' : ''}
          >
            {dnaCopy.periods[value]}
          </button>
        ))}
      </div>

      {!comparison.activeTastings.length ? (
        <motion.section {...reveal} className="rounded-[26px] border border-border bg-card p-6 text-center">
          <History className="mx-auto text-primary" size={24} />
          <p className="mt-3 text-sm text-muted-foreground">{dnaCopy.noPeriodData}</p>
          <button onClick={() => setPeriod('all')} className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">{dnaCopy.showAll}</button>
        </motion.section>
      ) : (
        <>
          <motion.section {...reveal} className="cm-dna-identity relative overflow-hidden rounded-[28px] border p-5">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="cm-dna-avatar flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">{profile.archetype.emoji}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dna-muted)]">{statsCopy.tasteIdentity}</p>
                <h2 className="mt-1 font-serif text-2xl text-[color:var(--dna-text)]">{profile.archetype.title}</h2>
                <p className="mt-2 text-[12px] leading-5 text-[color:var(--dna-subtle)]">{profile.archetype.subtitle}</p>
              </div>
              <div className="cm-dna-confidence rounded-full px-2.5 py-1 text-[10px] text-primary">{profile.archetype.confidence}%</div>
            </div>
            <div className="relative mt-5">
              <div className="mb-2 flex justify-between text-[10px]"><span className="text-[color:var(--dna-muted)]">{profile.maturityLabel}</span><span className="text-[color:var(--dna-subtle)]">{profile.maturity}%</span></div>
              <div className="cm-dna-track h-2 overflow-hidden rounded-full"><motion.div initial={{ width: 0 }} animate={{ width: `${profile.maturity}%` }} className="h-full rounded-full bg-primary" /></div>
              <p className="mt-2 text-[10px] text-[color:var(--dna-muted)]">{fillSectionCopy(statsCopy.tastingsToFullProfile, { count: Math.max(0, 20 - profile.sampleSize) })}</p>
            </div>
          </motion.section>

          <motion.section {...reveal} className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-border bg-card p-4"><Compass size={18} className="mb-3 text-primary" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.diversity}</p><p className="mt-1 text-2xl font-semibold"><AnimatedNumber value={profile.diversityIndex} suffix="%" /></p></div>
            <div className="rounded-[22px] border border-border bg-card p-4"><Sparkles size={18} className="mb-3 text-primary" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.averageScore}</p><p className="mt-1 text-2xl font-semibold"><AnimatedNumber value={profile.averages.overallScore} decimals={1} /></p></div>
          </motion.section>

          <motion.section {...reveal} className="cm-interactive-card rounded-[26px] border border-border bg-card p-5">
            <SectionHeading icon={Layers3} title={dnaCopy.profileStructure} description={dnaCopy.profileStructureHint} />
            {comparison.previousProfile && (
              <div className="mb-1 flex justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary" />{dnaCopy.current}</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full border border-muted-foreground/60" />{dnaCopy.previous}</span>
              </div>
            )}
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} margin={{ top: 18, right: 26, bottom: 18, left: 26 }}>
                  <PolarGrid stroke="var(--chart-grid)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--chart-label)', fontSize: 10 }} />
                  {comparison.previousProfile && <Radar dataKey="previous" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="4 5" strokeWidth={1.5} dot={false} />}
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 space-y-3">
              <Meter label={statsCopy.acidity} value={profile.averages.acidity} />
              <Meter label={statsCopy.sweetness} value={profile.averages.sweetness} />
              <Meter label={statsCopy.body} value={profile.averages.body} />
            </div>
          </motion.section>

          <motion.section {...reveal}>
            <SectionHeading icon={History} title={dnaCopy.dynamics} description={dnaCopy.dynamicsHint} />
            {mostRelevantDeltas.length ? (
              <div className="grid grid-cols-2 gap-3">
                {mostRelevantDeltas.map((metric) => (
                  <div key={metric.key} className="rounded-[21px] border border-border bg-card p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{metricLabel(metric.key, metricLabels)}</p>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p className="text-xl font-semibold">{metric.current.toFixed(metric.key === 'diversity' ? 0 : 1)}</p>
                      <DeltaBadge delta={metric.delta} suffix={metric.key === 'diversity' ? '%' : ''} />
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">{dnaCopy.previous}: {metric.previous.toFixed(metric.key === 'diversity' ? 0 : 1)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-border bg-card/50 p-5 text-[12px] leading-5 text-muted-foreground">{dnaCopy.notEnoughHistory}</div>
            )}
          </motion.section>

          <motion.section {...reveal} className="cm-interactive-card rounded-[26px] border border-border bg-card p-5">
            <SectionHeading icon={Sparkles} title={dnaCopy.flavorFamilies} description={dnaCopy.flavorFamiliesHint} />
            {profile.flavorFamilies.some((family) => family.value > 0) ? (
              <div className="space-y-3.5">
                {profile.flavorFamilies.slice(0, 6).map((family, index) => (
                  <div key={family.id}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px]"><span>{family.name}</span><span className="font-semibold text-muted-foreground">{family.value}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} whileInView={{ width: `${family.value}%` }} viewport={{ once: true }} transition={{ duration: 0.65, delay: index * 0.05 }} className="cm-dna-family-bar h-full rounded-full" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] leading-5 text-muted-foreground">{dnaCopy.noFlavorSignals}</p>
            )}
          </motion.section>

          {profile.topDescriptors.length > 0 && (
            <motion.section {...reveal} className="cm-interactive-card rounded-[26px] border border-border bg-card p-5">
              <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{statsCopy.tasteSignature}</p>
              <div className="flex flex-wrap gap-2">
                {profile.topDescriptors.map((item) => {
                  const localizedName = localizeFlavor(item.name, language);
                  const style = flavorChipStyle(item.name);
                  return <span key={item.name} className={`${style.bg} ${style.text} ${style.ring} rounded-full px-3 py-1.5 text-[12px] font-medium ring-1`}>{localizedName}<span className="ml-1 opacity-45">×{item.count}</span></span>;
                })}
              </div>
            </motion.section>
          )}

          <motion.section {...reveal} className="grid gap-3">
            {profile.topCountries[0] && <div className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-4"><MapPin className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.favoriteOrigin}</p><p className="mt-1 font-medium">{localizeCountry(profile.topCountries[0].name, language)} · {profile.topCountries[0].share}%</p></div></div>}
            {profile.topProcesses[0] && <div className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-4"><Droplets className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.favoriteProcess}</p><p className="mt-1 font-medium">{localizeProcessing(profile.topProcesses[0].name, language)} · {profile.topProcesses[0].averageScore.toFixed(1)} {statsCopy.points}</p></div></div>}
            {profile.topMethods[0] && <div className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-4"><Coffee className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.mainMethod}</p><p className="mt-1 font-medium">{localizeBrewMethod(profile.topMethods[0].name, language)}</p></div></div>}
          </motion.section>

          {influential.length > 0 && (
            <motion.section {...reveal}>
              <SectionHeading icon={Eye} title={dnaCopy.shapedBy} description={dnaCopy.shapedByHint} />
              <div className="space-y-3">
                {influential.map((item, index) => (
                  <motion.button
                    key={item.tasting.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    onClick={() => setLocation(`/tasting/${item.tasting.id}`)}
                    className="cm-dna-influence-card w-full text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-serif text-[17px] text-foreground">{item.tasting.coffeeName || localizeCountry(item.tasting.country, language)}</span>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">{item.influence}%</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">{localizeCountry(item.tasting.country, language)} · {localizeProcessing(item.tasting.processing || item.tasting.process, language)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{item.reasons.join(' · ')}</p>
                    </div>
                    <ChevronRight size={17} className="shrink-0 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          <motion.section {...reveal}>
            <SectionHeading icon={Route} title={dnaCopy.exploration} description={dnaCopy.explorationHint} />
            <div className="cm-dna-gap-grid">
              {explorationGaps.map((gap) => {
                const Icon = GAP_ICON[gap.kind];
                return (
                  <article key={gap.id} className="cm-dna-gap-card">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon size={17} /></div>
                    <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{gap.title}</p>
                    <h3 className="mt-1.5 font-serif text-lg leading-tight text-foreground">{gap.value}</h3>
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{gap.description}</p>
                  </article>
                );
              })}
            </div>
          </motion.section>

          <motion.section {...reveal} className="cm-dna-next-card relative overflow-hidden rounded-[28px] border p-5">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <SectionHeading icon={Target} title={dnaCopy.nextCoffee} description={dnaCopy.nextCoffeeHint} />
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  [dnaCopy.origin, recommendation.country],
                  [dnaCopy.processing, recommendation.processing],
                  [dnaCopy.method, recommendation.method],
                  [dnaCopy.focus, recommendation.focus],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[18px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
                    <p className="text-[9px] uppercase tracking-wider text-white/45">{label}</p>
                    <p className="mt-1.5 text-[12px] font-semibold leading-4 text-white/90">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-5 text-white/60">{recommendation.rationale}</p>
              <button onClick={() => setLocation('/add')} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                {dnaCopy.addTasting}<ArrowRight size={16} />
              </button>
            </div>
          </motion.section>

          {insights.length > 0 && (
            <motion.section {...reveal}>
              <div className="mb-3 flex items-center gap-2"><Sparkles size={16} className="text-primary" /><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{statsCopy.insights}</p></div>
              <div className="space-y-3">
                {insights.map((insight, index) => <motion.article initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} whileTap={{ scale: 0.985 }} key={insight.title} className={`cm-interactive-card rounded-[22px] border p-4 ${TONE_CLASS[insight.tone]}`}><h3 className="text-[13px] font-semibold">{insight.title}</h3><p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{insight.body}</p></motion.article>)}
              </div>
            </motion.section>
          )}
        </>
      )}
    </div>
  );
}
