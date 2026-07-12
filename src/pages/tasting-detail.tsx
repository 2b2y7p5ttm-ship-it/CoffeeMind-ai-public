import { useLocation, useParams } from 'wouter';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { ChevronLeft, Trash2, Pencil, Calendar, MapPin, Coffee, Droplets, Clock, Thermometer, Wind, Zap, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ScoreBar } from '@/components/ScoreBar';
import { flavorChipStyle, countryToFlag } from '@/lib/coffeeUtils';

// ─── Compat helpers ───────────────────────────────────────────────────────────

function getProcessing(t: Tasting): string {
  return t.processing || t.process || '';
}
function getBrewMethod(t: Tasting): string {
  return t.brewMethod || t.brewingMethod || '';
}
function getDryAroma(t: Tasting): string {
  return t.dryAroma || t.aroma || '';
}
function getFirstImpression(t: Tasting): string {
  return t.firstImpression || t.flavor || '';
}
function getAftertasteScore(t: Tasting): number {
  const v = Number(t.aftertaste);
  return isFinite(v) && v > 0 ? v : (t.aftertasteScore ?? 0);
}
function getTopDescriptors(t: Tasting): string[] {
  return t.topThreeDescriptors?.length ? t.topThreeDescriptors : (t.flavorDescriptors || []);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={13} className="text-primary/70" />
      <span className="text-[10px] uppercase tracking-widest font-bold text-primary/80">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-white/[0.04] last:border-0 gap-4">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/55 font-semibold flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function BrewStat({ label, value, unit }: { label: string; value: string | undefined; unit: string }) {
  if (!value) return null;
  return (
    <div className="bg-background/50 rounded-2xl px-3 py-3 flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">{label}</span>
      <span className="font-serif text-xl text-foreground leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground/40 font-medium">{unit}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TastingDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { getTasting, deleteTasting } = useTastings();

  const tasting = getTasting(id || '');

  if (!tasting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h2 className="font-serif text-2xl font-medium mb-2">Tasting not found</h2>
        <p className="text-muted-foreground text-[14px] mb-6">This record may have been deleted.</p>
        <button onClick={() => setLocation('/')}
          className="bg-card border border-border px-6 py-2.5 rounded-full text-[14px] font-medium">
          Back Home
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Delete this tasting? This cannot be undone.')) {
      deleteTasting(tasting.id);
      setLocation('/');
    }
  };

  const processing = getProcessing(tasting);
  const brewMethod = getBrewMethod(tasting);
  const dryAroma = getDryAroma(tasting);
  const firstImpression = getFirstImpression(tasting);
  const aftertasteScore = getAftertasteScore(tasting);
  const topDescriptors = getTopDescriptors(tasting);
  const additionalDescriptors = tasting.additionalDescriptors || [];
  const flag = countryToFlag(tasting.country);

  const scoreColor = tasting.overallScore >= 90
    ? 'text-emerald-300' : tasting.overallScore >= 80
    ? 'text-amber-300' : 'text-foreground';

  const doseRatio = tasting.doseGrams && tasting.beverageWeightGrams && Number(tasting.doseGrams) > 0
    ? `1:${(Number(tasting.beverageWeightGrams) / Number(tasting.doseGrams)).toFixed(1)}`
    : null;

  return (
    <div className="bg-background min-h-screen pb-10">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-52 overflow-hidden flex items-end"
        style={{ background: 'linear-gradient(135deg, #1a1008 0%, #0B0B0B 100%)' }}>
        {tasting.photoUrl && (
          <img src={tasting.photoUrl} alt={tasting.coffeeName}
            className="absolute inset-0 w-full h-full object-cover opacity-35" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <button onClick={() => setLocation('/')}
          className="absolute top-14 left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-black/60 transition-colors z-10">
          <ChevronLeft size={22} />
        </button>

        <div className="absolute top-14 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setLocation(`/tasting/${tasting.id}/edit`)}
            className="w-10 h-10 bg-black/40 backdrop-blur-md text-primary rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
            aria-label="Редактировать дегустацию"
            data-testid="btn-edit"
          >
            <Pencil size={16} />
          </button>
          <button onClick={handleDelete}
            className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center hover:bg-destructive/20 transition-colors"
            aria-label="Удалить дегустацию"
            data-testid="btn-delete">
            <Trash2 size={17} />
          </button>
        </div>

        <div className="relative z-10 w-full px-4 pb-4 flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            {flag && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base leading-none">{flag}</span>
                <span className="text-[11px] text-white/60 font-medium">{tasting.country}</span>
              </div>
            )}
            <h1 className="font-serif text-[1.9rem] font-medium leading-tight text-foreground truncate">
              {tasting.coffeeName}
            </h1>
            {tasting.roaster && (
              <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{tasting.roaster}</p>
            )}
          </div>

          <div className="bg-background/60 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 flex flex-col items-center flex-shrink-0 shadow-xl">
            <span className={`text-3xl font-serif font-medium leading-none ${scoreColor}`}>{tasting.overallScore}</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-1.5 font-medium">Score</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-7">

        {/* ── Date + badges ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-card/60 border border-white/[0.06] px-3 py-1.5 rounded-full">
            <Calendar size={11} className="text-primary/70" />
            {format(new Date(tasting.createdAt), 'MMMM d, yyyy')}
          </span>
          {processing && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full border border-primary/20">
              <span className="w-1 h-1 rounded-full bg-primary" />
              {processing}
            </span>
          )}
        </div>

        {/* ── Coffee info ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Coffee} label="Origin & Bean" />
          <div className="bg-card/60 border border-white/[0.06] rounded-2xl overflow-hidden">
            <InfoRow label="Roaster"   value={tasting.roaster} />
            <InfoRow label="Country"   value={tasting.country} />
            <InfoRow label="Region"    value={tasting.region} />
            <InfoRow label="Farm"      value={tasting.farm} />
            <InfoRow label="Variety"   value={tasting.variety} />
            <InfoRow label="Processing" value={processing} />
            <InfoRow label="Roast Date" value={tasting.roastDate} />
          </div>
        </section>

        {/* ── Brewing ─────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Droplets} label="Brew Details" />
          <div className="space-y-3">
            {brewMethod && (
              <div className="bg-card/60 border border-white/[0.06] rounded-2xl px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/55 font-semibold">Method</span>
                <span className="text-[15px] font-semibold text-foreground">{brewMethod}</span>
              </div>
            )}

            {(tasting.doseGrams || tasting.beverageWeightGrams || tasting.brewTimeSeconds || tasting.waterTemperatureCelsius) && (
              <div className="grid grid-cols-4 gap-2">
                <BrewStat label="Dose" value={tasting.doseGrams} unit="g" />
                <BrewStat label="Yield" value={tasting.beverageWeightGrams} unit="g" />
                <BrewStat label="Time" value={tasting.brewTimeSeconds} unit="sec" />
                <BrewStat label="Temp" value={tasting.waterTemperatureCelsius} unit="°C" />
              </div>
            )}

            {doseRatio && (
              <div className="bg-primary/[0.07] border border-primary/20 rounded-xl px-4 py-2.5 flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground font-medium">Brew Ratio</span>
                <span className="font-serif text-primary text-lg">{doseRatio}</span>
              </div>
            )}

            {/* Legacy brew fields */}
            {(!tasting.doseGrams && tasting.dose) && (
              <InfoRow label="Dose" value={`${tasting.dose}g`} />
            )}
          </div>
        </section>

        {/* ── Sensory text ────────────────────────────────────────────────── */}
        {(dryAroma || tasting.wetAroma || firstImpression) && (
          <section>
            <SectionHeader icon={Wind} label="Sensory" />
            <div className="space-y-2.5">
              {dryAroma && (
                <div className="bg-card/60 border border-white/[0.06] rounded-2xl px-4 py-3">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-semibold block mb-1.5">Dry Aroma</span>
                  <p className="text-[13px] font-medium text-foreground leading-relaxed">{dryAroma}</p>
                </div>
              )}
              {tasting.wetAroma && (
                <div className="bg-card/60 border border-white/[0.06] rounded-2xl px-4 py-3">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-semibold block mb-1.5">Wet Aroma</span>
                  <p className="text-[13px] font-medium text-foreground leading-relaxed">{tasting.wetAroma}</p>
                </div>
              )}
              {firstImpression && (
                <div className="bg-card/60 border border-white/[0.06] rounded-2xl px-4 py-3">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-semibold block mb-1.5">First Impression</span>
                  <p className="text-[13px] font-medium text-foreground leading-relaxed">{firstImpression}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Score bars ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Zap} label="Attribute Scores" />
          <div className="bg-card/60 border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <ScoreBar label="Acidity"    value={tasting.acidity} />
            <ScoreBar label="Sweetness"  value={tasting.sweetness} />
            <ScoreBar label="Body"       value={tasting.body} />
            <ScoreBar label="Bitterness" value={tasting.bitterness} />
            <ScoreBar label="Balance"    value={tasting.balance} />
            <ScoreBar label="Clean Cup"  value={tasting.cleanCup} />
            {aftertasteScore > 0 && <ScoreBar label="Aftertaste" value={aftertasteScore} />}
          </div>
        </section>

        {/* ── Flavor descriptors ──────────────────────────────────────────── */}
        {(topDescriptors.length > 0 || additionalDescriptors.length > 0) && (
          <section>
            <SectionHeader icon={Coffee} label="Flavor Profile" />
            <div className="space-y-3">
              {topDescriptors.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-semibold mb-2">Top Descriptors</p>
                  <div className="flex flex-wrap gap-2">
                    {topDescriptors.map((desc) => {
                      const { bg, text, ring } = flavorChipStyle(desc);
                      return (
                        <span key={desc} className={`${bg} ${text} ${ring} text-[12px] font-medium px-3 py-1.5 rounded-full ring-1`}>
                          {desc}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {additionalDescriptors.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-semibold mb-2">Additional</p>
                  <div className="flex flex-wrap gap-2">
                    {additionalDescriptors.map((desc) => (
                      <span key={desc} className="bg-white/[0.05] text-muted-foreground text-[12px] font-medium px-3 py-1.5 rounded-full ring-1 ring-white/10">
                        {desc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Notes ───────────────────────────────────────────────────────── */}
        {tasting.notes && (
          <section>
            <SectionHeader icon={FileText} label="Tasting Notes" />
            <div className="bg-card/30 border border-white/[0.04] rounded-2xl p-5 leading-relaxed text-[13px] text-foreground/80">
              {tasting.notes}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
