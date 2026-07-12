import { useMemo } from 'react';
import { useTastings, Tasting } from '@/hooks/useTastings';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { flavorChipStyle } from '@/lib/coffeeUtils';

// ─── Compat helpers ───────────────────────────────────────────────────────────

function getProcessing(t: Tasting): string { return t.processing || t.process || ''; }
function getBrewMethod(t: Tasting): string { return t.brewMethod || t.brewingMethod || ''; }
function getAftertasteScore(t: Tasting): number {
  const v = Number(t.aftertaste);
  return isFinite(v) && v > 0 ? v : (t.aftertasteScore ?? 5);
}
function getAllDescriptors(t: Tasting): string[] {
  return [
    ...(t.topThreeDescriptors || []),
    ...(t.additionalDescriptors || []),
    ...(t.flavorDescriptors || []),
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#161616',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'hsl(0 0% 92%)',
  },
  itemStyle: { color: '#D9A35F' },
  cursor: { stroke: 'rgba(217,163,95,0.15)' },
};

// ─── Stats Page ───────────────────────────────────────────────────────────────

export default function Stats() {
  const { tastings } = useTastings();

  const data = useMemo(() => {
    const total = tastings.length;
    if (!total) return null;

    // Radar (6 axes)
    const radarData = [
      { attribute: 'Acidity',   value: avg(tastings.map((t) => t.acidity)) },
      { attribute: 'Sweetness', value: avg(tastings.map((t) => t.sweetness)) },
      { attribute: 'Body',      value: avg(tastings.map((t) => t.body)) },
      { attribute: 'Bitterness',value: avg(tastings.map((t) => t.bitterness)) },
      { attribute: 'Balance',   value: avg(tastings.map((t) => t.balance ?? 5)) },
      { attribute: 'Aftertaste',value: avg(tastings.map((t) => getAftertasteScore(t))) },
    ];

    // Score history (area chart)
    const scoreHistory = [...tastings].reverse().map((t) => ({
      date: format(parseISO(t.createdAt), 'MMM d'),
      score: t.overallScore,
    }));

    // Top origins
    const countryCounts: Record<string, number> = {};
    tastings.forEach((t) => {
      if (t.country) countryCounts[t.country] = (countryCounts[t.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Brewing methods
    const methodCounts: Record<string, number> = {};
    tastings.forEach((t) => {
      const m = getBrewMethod(t);
      if (m) methodCounts[m] = (methodCounts[m] || 0) + 1;
    });
    const topMethods = Object.entries(methodCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Processing methods
    const processCounts: Record<string, number> = {};
    tastings.forEach((t) => {
      const p = getProcessing(t);
      if (p) processCounts[p] = (processCounts[p] || 0) + 1;
    });
    const topProcesses = Object.entries(processCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Flavor cloud
    const flavorCounts: Record<string, number> = {};
    tastings.forEach((t) => {
      getAllDescriptors(t).forEach((d) => {
        flavorCounts[d] = (flavorCounts[d] || 0) + 1;
      });
    });
    const flavorCloud = Object.entries(flavorCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 24);

    return { radarData, scoreHistory, topCountries, topMethods, topProcesses, flavorCloud, total };
  }, [tastings]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 text-center pb-28">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="font-serif text-2xl font-medium text-foreground mb-2">No data yet</h1>
        <p className="text-muted-foreground text-[14px]">Log some tastings to see your insights.</p>
      </div>
    );
  }

  const maxFlavor = data.flavorCloud[0]?.[1] || 1;

  return (
    <div className="px-4 iphone-safe-top pb-28 min-h-full space-y-6">
      <header>
        <h1 className="font-serif text-[2rem] font-medium text-foreground">Insights</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">Your palate in numbers.</p>
      </header>

      {/* Taste Profile Radar */}
      <section className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-5">Taste Profile</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data.radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="attribute" tick={{ fill: 'hsl(0 0% 50%)', fontSize: 10, fontFamily: 'Inter, sans-serif' }} />
              <Radar dataKey="value" stroke="#D9A35F" fill="#D9A35F" fillOpacity={0.12} strokeWidth={2}
                dot={{ r: 3, fill: '#D9A35F', strokeWidth: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Score over time */}
      {data.scoreHistory.length > 1 && (
        <section className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-5">Score Over Time</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.scoreHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D9A35F" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#D9A35F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" stroke="transparent" tick={{ fill: 'hsl(0 0% 45%)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} stroke="transparent" tick={{ fill: 'hsl(0 0% 45%)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="score" stroke="#D9A35F" strokeWidth={2.5} fill="url(#scoreGrad)"
                  dot={{ r: 3.5, fill: '#0B0B0B', stroke: '#D9A35F', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Top Origins */}
      {data.topCountries.length > 0 && (
        <section className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-5">Favorite Origins</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCountries} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }} tickLine={false} axisLine={false} width={75} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#D9A35F" radius={[0, 6, 6, 0]} barSize={14} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Brewing Methods */}
      {data.topMethods.length > 1 && (
        <section className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-5">Brewing Methods</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topMethods} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="hsl(198 70% 55%)" radius={[0, 6, 6, 0]} barSize={14} fillOpacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Flavor Cloud */}
      {data.flavorCloud.length > 0 && (
        <section className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-4">Flavor Cloud</p>
          <div className="flex flex-wrap gap-2">
            {data.flavorCloud.map(([word, count]) => {
              const { bg, text, ring } = flavorChipStyle(word);
              const size = 0.75 + (count / maxFlavor) * 0.45;
              return (
                <span key={word} className={`${bg} ${text} ${ring} ring-1 px-3 py-1.5 rounded-full font-medium`}
                  style={{ fontSize: `${size * 13}px`, opacity: 0.6 + (count / maxFlavor) * 0.4 }}>
                  {word}
                  {count > 1 && <span className="opacity-50 ml-1 text-[10px]">×{count}</span>}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Processing breakdown */}
      {data.topProcesses.length > 0 && (
        <section className="bg-card/60 border border-white/[0.06] rounded-[24px] p-5">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-4">Processing Methods</p>
          <div className="space-y-3">
            {data.topProcesses.map(({ name, count }) => {
              const pct = (count / data.total) * 100;
              return (
                <div key={name}>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-foreground font-medium">{name}</span>
                    <span className="text-muted-foreground">{count}×</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
