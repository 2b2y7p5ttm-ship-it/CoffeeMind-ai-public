import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, Compass, Droplets, Coffee, MapPin } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useTastings } from '@/hooks/useTastings';
import { buildTasteProfile } from '@/lib/intelligence/tasteProfile';
import { generateTasteInsights } from '@/lib/intelligence/insights';
import { flavorChipStyle } from '@/lib/coffeeUtils';

const TONE_CLASS = {
  gold: 'border-amber-400/15 bg-amber-400/[0.06]',
  berry: 'border-fuchsia-400/15 bg-fuchsia-400/[0.06]',
  blue: 'border-sky-400/15 bg-sky-400/[0.06]',
  green: 'border-emerald-400/15 bg-emerald-400/[0.06]',
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
  const profile = useMemo(() => buildTasteProfile(tastings), [tastings]);
  const insights = useMemo(() => generateTasteInsights(tastings, profile), [tastings, profile]);
  const radar = [
    { name: 'Кислотность', value: profile.averages.acidity },
    { name: 'Сладость', value: profile.averages.sweetness },
    { name: 'Тело', value: profile.averages.body },
    { name: 'Послевкусие', value: profile.averages.aftertaste },
    { name: 'Баланс', value: profile.averages.balance },
  ];

  if (!tastings.length) {
    return (
      <div className="min-h-[100dvh] px-6 pb-28 iphone-safe-top flex flex-col justify-center text-center">
        <div className="mx-auto w-20 h-20 rounded-[28px] bg-primary/10 border border-primary/15 flex items-center justify-center mb-6"><Dna className="text-primary" size={34} /></div>
        <h1 className="font-serif text-3xl text-foreground">Coffee DNA</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-6">Добавь первые дегустации, и CoffeeMind начнёт находить закономерности в твоём вкусе.</p>
      </div>
    );
  }

  return (
    <div className="px-4 iphone-safe-top pb-28 min-h-full space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-primary/70 font-semibold mb-1">Taste Intelligence</p>
          <h1 className="font-serif text-[2.05rem] leading-none text-foreground">Coffee DNA</h1>
        </div>
        <div className="text-right"><p className="text-2xl font-semibold text-primary">{profile.sampleSize}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">чашек</p></div>
      </header>

      <section className="cm-dna-identity relative overflow-hidden rounded-[28px] border p-5">
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="cm-dna-avatar w-14 h-14 rounded-2xl flex items-center justify-center text-3xl">{profile.archetype.emoji}</div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dna-muted)]">Taste Identity</p>
            <h2 className="font-serif text-2xl text-[color:var(--dna-text)] mt-1">{profile.archetype.title}</h2>
            <p className="text-[12px] leading-5 text-[color:var(--dna-subtle)] mt-2">{profile.archetype.subtitle}</p>
          </div>
          <div className="cm-dna-confidence rounded-full px-2.5 py-1 text-[10px] text-primary">{profile.archetype.confidence}%</div>
        </div>
        <div className="relative mt-5">
          <div className="flex justify-between text-[10px] mb-2"><span className="text-[color:var(--dna-muted)]">{profile.maturityLabel}</span><span className="text-[color:var(--dna-subtle)]">{profile.maturity}%</span></div>
          <div className="cm-dna-track h-2 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${profile.maturity}%` }} className="h-full rounded-full bg-primary" /></div>
          <p className="text-[10px] text-[color:var(--dna-muted)] mt-2">{Math.max(0, 20 - profile.sampleSize)} дегустаций до полного профиля</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-border bg-card p-4"><Compass size={18} className="text-primary mb-3" /><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Разнообразие</p><p className="text-2xl font-semibold mt-1">{profile.diversityIndex}%</p></div>
        <div className="rounded-[22px] border border-border bg-card p-4"><Sparkles size={18} className="text-primary mb-3" /><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Средний балл</p><p className="text-2xl font-semibold mt-1">{profile.averages.overallScore.toFixed(1)}</p></div>
      </section>

      <section className="rounded-[26px] border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3"><Dna size={17} className="text-primary" /><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Вкусовая карта</p></div>
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
          <Meter label="Кислотность" value={profile.averages.acidity} />
          <Meter label="Сладость" value={profile.averages.sweetness} />
          <Meter label="Тело" value={profile.averages.body} />
        </div>
      </section>

      {profile.topDescriptors.length > 0 && (
        <section className="rounded-[26px] border border-border bg-card p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">Вкусовой почерк</p>
          <div className="flex flex-wrap gap-2">
            {profile.topDescriptors.map((item) => {
              const style = flavorChipStyle(item.name);
              return <span key={item.name} className={`${style.bg} ${style.text} ${style.ring} ring-1 rounded-full px-3 py-1.5 text-[12px] font-medium`}>{item.name}<span className="opacity-45 ml-1">×{item.count}</span></span>;
            })}
          </div>
        </section>
      )}

      <section className="grid gap-3">
        {profile.topCountries[0] && <div className="rounded-[22px] border border-border bg-card p-4 flex items-center gap-4"><MapPin className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Любимое происхождение</p><p className="font-medium mt-1">{profile.topCountries[0].name} · {profile.topCountries[0].share}%</p></div></div>}
        {profile.topProcesses[0] && <div className="rounded-[22px] border border-border bg-card p-4 flex items-center gap-4"><Droplets className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Любимая обработка</p><p className="font-medium mt-1">{profile.topProcesses[0].name} · {profile.topProcesses[0].averageScore.toFixed(1)} балла</p></div></div>}
        {profile.topMethods[0] && <div className="rounded-[22px] border border-border bg-card p-4 flex items-center gap-4"><Coffee className="text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Основной способ</p><p className="font-medium mt-1">{profile.topMethods[0].name}</p></div></div>}
      </section>

      {insights.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3"><Sparkles size={16} className="text-primary" /><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">CoffeeMind Insights</p></div>
          <div className="space-y-3">
            {insights.map((insight) => <article key={insight.title} className={`rounded-[22px] border p-4 ${TONE_CLASS[insight.tone]}`}><h3 className="text-[13px] font-semibold">{insight.title}</h3><p className="text-[12px] leading-5 text-muted-foreground mt-1.5">{insight.body}</p></article>)}
          </div>
        </section>
      )}
    </div>
  );
}
