import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Dna, Sparkles, Compass, Droplets, Coffee, MapPin } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useTastings } from '@/hooks/useTastings';
import { buildTasteProfile } from '@/lib/intelligence/tasteProfile';
import { generateTasteInsights } from '@/lib/intelligence/insights';
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

const reveal = {
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, value * 10)}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full bg-gradient-to-r from-primary/55 to-primary" />
      </div>
    </div>
  );
}

export default function Stats() {
  const { tastings } = useTastings();
  const { copy, language } = useSectionCopy();
  const statsCopy = copy.stats;
  const profile = useMemo(() => buildTasteProfile(tastings, language), [tastings, language]);
  const insights = useMemo(() => generateTasteInsights(tastings, profile, language), [tastings, profile, language]);
  const radar = [
    { name: statsCopy.acidity, value: profile.averages.acidity },
    { name: statsCopy.sweetness, value: profile.averages.sweetness },
    { name: statsCopy.body, value: profile.averages.body },
    { name: statsCopy.aftertaste, value: profile.averages.aftertaste },
    { name: statsCopy.balance, value: profile.averages.balance },
  ];

  if (!tastings.length) {
    return (
      <div className="min-h-[100dvh] px-6 pb-28 iphone-safe-top flex flex-col justify-center text-center">
        <div className="mx-auto w-20 h-20 rounded-[28px] bg-primary/10 border border-primary/15 flex items-center justify-center mb-6"><Dna className="text-primary" size={34} /></div>
        <h1 className="font-serif text-3xl text-foreground">Coffee DNA</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-6">{statsCopy.emptyText}</p>
      </div>
    );
  }

  return (
    <div className="px-4 iphone-safe-top pb-28 min-h-full space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-primary/70 font-semibold mb-1">{statsCopy.eyebrow}</p>
          <h1 className="font-serif text-[2.05rem] leading-none text-foreground">Coffee DNA</h1>
        </div>
        <div className="text-right"><p className="text-2xl font-semibold text-primary"><AnimatedNumber value={profile.sampleSize} /></p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">{statsCopy.cups}</p></div>
      </header>

      <motion.section {...reveal} className="cm-dna-identity relative overflow-hidden rounded-[28px] border p-5">
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="cm-dna-avatar w-14 h-14 rounded-2xl flex items-center justify-center text-3xl">{profile.archetype.emoji}</div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dna-muted)]">{statsCopy.tasteIdentity}</p>
            <h2 className="font-serif text-2xl text-[color:var(--dna-text)] mt-1">{profile.archetype.title}</h2>
            <p className="text-[12px] leading-5 text-[color:var(--dna-subtle)] mt-2">{profile.archetype.subtitle}</p>
          </div>
          <div className="cm-dna-confidence rounded-full px-2.5 py-1 text-[10px] text-primary">{profile.archetype.confidence}%</div>
        </div>
        <div className="relative mt-5">
          <div className="flex justify-between text-[10px] mb-2"><span className="text-[color:var(--dna-muted)]">{profile.maturityLabel}</span><span className="text-[color:var(--dna-subtle)]">{profile.maturity}%</span></div>
          <div className="cm-dna-track h-2 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${profile.maturity}%` }} className="h-full rounded-full bg-primary" /></div>
          <p className="text-[10px] text-[color:var(--dna-muted)] mt-2">{fillSectionCopy(statsCopy.tastingsToFullProfile, { count: Math.max(0, 20 - profile.sampleSize) })}</p>
        </div>
      </motion.section>

      <motion.section {...reveal} className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-border bg-card p-4"><Compass size={18} className="text-primary mb-3" /><p className="text-[10px] text-muted-foreground uppercase tracking-wider">{statsCopy.diversity}</p><p className="text-2xl font-semibold mt-1"><AnimatedNumber value={profile.diversityIndex} suffix="%" /></p></div>
        <div className="rounded-[22px] border border-border bg-card p-4"><Sparkles size={18} className="text-primary mb-3" /><p className="text-[10px] text-muted-foreground uppercase tracking-wider">{statsCopy.averageScore}</p><p className="text-2xl font-semibold mt-1"><AnimatedNumber value={profile.averages.overallScore} decimals={1} /></p></div>
      </motion.section>

      <motion.section {...reveal} className="cm-interactive-card rounded-[26px] border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3"><Dna size={17} className="text-primary" /><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{statsCopy.tasteMap}</p></div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radar} margin={{ top: 14, right: 24, bottom: 14, left: 24 }}>
              <PolarGrid stroke="var(--chart-grid)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--chart-label)', fontSize: 10 }} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 mt-1">
          <Meter label={statsCopy.acidity} value={profile.averages.acidity} />
          <Meter label={statsCopy.sweetness} value={profile.averages.sweetness} />
          <Meter label={statsCopy.body} value={profile.averages.body} />
        </div>
      </motion.section>

      {profile.topDescriptors.length > 0 && (
        <motion.section {...reveal} className="cm-interactive-card rounded-[26px] border border-border bg-card p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">{statsCopy.tasteSignature}</p>
          <div className="flex flex-wrap gap-2">
            {profile.topDescriptors.map((item) => {
              const localizedName = localizeFlavor(item.name, language);
              const style = flavorChipStyle(item.name);
              return <span key={item.name} className={`${style.bg} ${style.text} ${style.ring} ring-1 rounded-full px-3 py-1.5 text-[12px] font-medium`}>{localizedName}<span className="opacity-45 ml-1">×{item.count}</span></span>;
            })}
          </div>
        </motion.section>
      )}

      <motion.section {...reveal} className="grid gap-3">
        {profile.topCountries[0] && <div className="rounded-[22px] border border-border bg-card p-4 flex items-center gap-4"><MapPin className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.favoriteOrigin}</p><p className="font-medium mt-1">{localizeCountry(profile.topCountries[0].name, language)} · {profile.topCountries[0].share}%</p></div></div>}
        {profile.topProcesses[0] && <div className="rounded-[22px] border border-border bg-card p-4 flex items-center gap-4"><Droplets className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.favoriteProcess}</p><p className="font-medium mt-1">{localizeProcessing(profile.topProcesses[0].name, language)} · {profile.topProcesses[0].averageScore.toFixed(1)} {statsCopy.points}</p></div></div>}
        {profile.topMethods[0] && <div className="rounded-[22px] border border-border bg-card p-4 flex items-center gap-4"><Coffee className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{statsCopy.mainMethod}</p><p className="font-medium mt-1">{localizeBrewMethod(profile.topMethods[0].name, language)}</p></div></div>}
      </motion.section>

      {insights.length > 0 && (
        <motion.section {...reveal}>
          <div className="flex items-center gap-2 mb-3"><Sparkles size={16} className="text-primary" /><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{statsCopy.insights}</p></div>
          <div className="space-y-3">
            {insights.map((insight, index) => <motion.article initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} whileTap={{ scale: 0.985 }} key={insight.title} className={`cm-interactive-card rounded-[22px] border p-4 ${TONE_CLASS[insight.tone]}`}><h3 className="text-[13px] font-semibold">{insight.title}</h3><p className="text-[12px] leading-5 text-muted-foreground mt-1.5">{insight.body}</p></motion.article>)}
          </div>
        </motion.section>
      )}
    </div>
  );
}
