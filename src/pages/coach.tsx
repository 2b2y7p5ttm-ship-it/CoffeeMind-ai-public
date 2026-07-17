import { useLocation, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle2, ChevronLeft, Coffee, Sparkles, Target } from 'lucide-react';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { flavorChipStyle } from '@/lib/coffeeUtils';
import { fill, localizeFlavor, useTastingCopy, type TastingCopy } from '@/lib/tastingI18n';

function getProcessing(t: Tasting): string {
  return t.processing || t.process || '';
}

function getDescriptors(t: Tasting): string[] {
  const top = t.topThreeDescriptors?.length ? t.topThreeDescriptors : (t.flavorDescriptors || []);
  return [...top, ...(t.additionalDescriptors || [])].filter(Boolean);
}

function acidityHint(value: number, c: TastingCopy['coach']): string {
  if (value >= 8) return c.acidityHigh;
  if (value >= 6) return c.acidityMedium;
  return c.acidityLow;
}

function sweetnessHint(value: number, c: TastingCopy['coach']): string {
  if (value >= 8) return c.sweetnessHigh;
  if (value >= 6) return c.sweetnessMedium;
  return c.sweetnessLow;
}

function descriptorPrompt(descriptors: string[], c: TastingCopy['coach']): string {
  if (!descriptors.length) return c.noDescriptor;
  return fill(c.descriptor, { name: descriptors[0] });
}

function qGraderQuestions(t: Tasting, descriptors: string[], c: TastingCopy['coach']): string[] {
  const first = descriptors[0] || c.mainFlavor;
  return [
    fill(c.q1, { name: first }),
    fill(c.q2, { value: t.acidity }),
    c.q3,
  ];
}

export default function Coach() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { getTasting } = useTastings();
  const { copy, language } = useTastingCopy();
  const c = copy.coach;
  const tasting = getTasting(id || '');

  if (!tasting) {
    return (
      <div className="min-h-screen bg-background px-4 iphone-safe-top text-center">
        <h1 className="font-serif text-2xl mb-2">{c.notFound}</h1>
        <p className="text-muted-foreground text-[14px] mb-6">{c.notFoundText}</p>
        <button onClick={() => setLocation('/')} className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-[14px] font-semibold">
          {c.backHome}
        </button>
      </div>
    );
  }

  const descriptors = getDescriptors(tasting);
  const processing = getProcessing(tasting);
  const strengths = [
    tasting.balance >= 7 ? c.balanceGood : c.balanceImprove,
    tasting.cleanCup >= 7 ? c.cleanGood : c.cleanImprove,
    tasting.aftertaste >= 7 ? c.aftertasteGood : c.aftertasteImprove,
  ];
  const questions = qGraderQuestions(tasting, descriptors.map((item) => localizeFlavor(item, language)), c);

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label={c.backHome}
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <Brain size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">AI Coach</span>
          </div>
          <h1 className="font-serif text-[2rem] leading-tight text-foreground mb-2">{c.title}</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">{c.intro}</p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        <section className="rounded-[24px] bg-card/70 border border-white/[0.07] p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-1">{c.saved}</p>
              <h2 className="font-serif text-2xl text-foreground">{tasting.coffeeName}</h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                {[tasting.country, processing, tasting.brewMethod || tasting.brewingMethod].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="rounded-2xl bg-background/70 border border-white/[0.07] px-3 py-2 text-center">
              <div className="font-serif text-2xl text-primary leading-none">{tasting.overallScore}</div>
              <div className="text-[8px] uppercase tracking-widest text-muted-foreground/50 mt-1">pts</div>
            </div>
          </div>

          {descriptors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {descriptors.slice(0, 6).map((desc) => {
                const { bg, text, ring } = flavorChipStyle(desc);
                return <span key={desc} className={`${bg} ${text} ${ring} ring-1 rounded-full px-3 py-1.5 text-[12px] font-medium`}>{localizeFlavor(desc, language)}</span>;
              })}
            </div>
          )}
        </section>

        <section className="rounded-[24px] bg-primary/[0.07] border border-primary/20 p-5">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <Sparkles size={16} />
            <h3 className="text-[12px] uppercase tracking-widest font-bold">{c.mainThought}</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-foreground">{descriptorPrompt(descriptors.map((item) => localizeFlavor(item, language)), c)}</p>
        </section>

        <section className="rounded-[24px] bg-card/60 border border-white/[0.07] p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Coffee size={15} />
            <h3 className="text-[12px] uppercase tracking-widest font-bold">{c.nextTime}</h3>
          </div>
          {[acidityHint(tasting.acidity, c), sweetnessHint(tasting.sweetness, c), ...strengths].map((item) => (
            <div key={item} className="flex gap-3">
              <CheckCircle2 size={16} className="text-primary/80 mt-0.5 flex-shrink-0" />
              <p className="text-[13px] leading-relaxed text-muted-foreground">{item}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[24px] bg-card/60 border border-white/[0.07] p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Target size={15} />
            <h3 className="text-[12px] uppercase tracking-widest font-bold">{c.questions}</h3>
          </div>
          {questions.map((question, index) => (
            <div key={question} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{question}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[24px] bg-card/40 border border-white/[0.05] p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold mb-3">{c.miniTask}</p>
          <p className="text-[14px] leading-relaxed text-foreground">{c.miniTaskText}</p>
        </section>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setLocation(`/tasting/${tasting.id}`)}
            className="h-12 rounded-full bg-card border border-white/[0.08] text-foreground text-[13px] font-semibold"
          >
            {c.openRecord}
          </button>
          <button
            onClick={() => setLocation('/')}
            className="h-12 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5"
          >
            {c.journal}
            <ArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}
