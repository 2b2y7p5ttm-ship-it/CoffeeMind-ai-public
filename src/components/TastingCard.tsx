import { useState } from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MoreHorizontal, Trash2, Star } from 'lucide-react';
import { Tasting } from '@/hooks/useTastings';
import { useTastings } from '@/hooks/useTastings';
import { countryToFlag, getCardPhoto, flavorChipStyle } from '@/lib/coffeeUtils';
import { BrewMethodIcon } from './BrewMethodIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizeProcessing } from '@/lib/processingI18n';
import { localizeBrewMethod } from '@/lib/brewMethodI18n';

// ─── Compat helpers ───────────────────────────────────────────────────────────

function getProcessing(t: Tasting): string {
  return t.processing || t.process || '';
}
function getBrewMethod(t: Tasting): string {
  return t.brewMethod || t.brewingMethod || '';
}
function getDescriptors(t: Tasting): string[] {
  if (t.topThreeDescriptors?.length) return t.topThreeDescriptors.slice(0, 3);
  if (t.flavorDescriptors?.length) return t.flavorDescriptors.slice(0, 3);
  return [];
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface TastingCardProps {
  tasting: Tasting;
  index?: number;
}

export function TastingCard({ tasting, index = 0 }: TastingCardProps) {
  const { updateTasting, deleteTasting } = useTastings();
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const flag = countryToFlag(tasting.country);
  const photo = tasting.photoUrl || getCardPhoto(tasting.id);
  const processing = localizeProcessing(getProcessing(tasting), language);
  const brewMethod = getBrewMethod(tasting);
  const brewMethodLabel = localizeBrewMethod(brewMethod, language);
  const descriptors = getDescriptors(tasting);

  const scoreColor =
    tasting.overallScore >= 90 ? 'text-emerald-300'
    : tasting.overallScore >= 80 ? 'text-amber-300'
    : 'text-foreground/70';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateTasting(tasting.id, { favorite: !tasting.favorite });
  };

  const handleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    deleteTasting(tasting.id);
  };

  const closeMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.35), type: 'spring', stiffness: 260, damping: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileTap={{ scale: 0.975 }}
      className="relative"
      data-testid={`card-tasting-${tasting.id}`}
    >
      <Link href={`/tasting/${tasting.id}`}>
        <div className="rounded-[26px] overflow-hidden bg-card border border-white/[0.06] shadow-[0_8px_34px_rgba(0,0,0,0.38)] cursor-pointer iphone-card">

          {/* ── Photo ───────────────────────────────────────────────────── */}
          <div className="relative h-[13.25rem] overflow-hidden bg-muted">
            <img src={photo} alt={tasting.coffeeName} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/45 via-45% to-black/15" />
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/55 to-transparent" />

            {flag && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
                <span className="text-base leading-none">{flag}</span>
                {tasting.country && (
                  <span className="text-[10px] font-medium text-white/80 tracking-wide">{tasting.country}</span>
                )}
              </div>
            )}

            <div className={`absolute top-3 right-3 flex flex-col items-center bg-black/45 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/10 min-w-[3.2rem] ${tasting.overallScore >= 90 ? 'shadow-[0_0_12px_rgba(52,211,153,0.25)]' : ''}`}>
              <span className={`text-xl font-serif font-semibold leading-none ${scoreColor}`}>{tasting.overallScore}</span>
              <span className="text-[8px] uppercase tracking-widest text-white/35 mt-0.5 font-medium">pts</span>
            </div>

            <div className="absolute left-4 right-4 bottom-4">
              <h3 className="font-serif text-[1.65rem] font-medium leading-tight text-foreground">
                {tasting.coffeeName}
              </h3>
              {tasting.roaster && (
                <p className="text-[12px] text-white/60 mt-0.5 font-medium">{tasting.roaster}</p>
              )}
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────────────── */}
          <div className="px-4 pt-4 pb-4 space-y-3">
            {processing && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/20">
                <span className="w-1 h-1 rounded-full bg-primary" />
                {processing}
              </span>
            )}

            {descriptors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {descriptors.map((d) => {
                  const { bg, text, ring } = flavorChipStyle(d);
                  return (
                    <span key={d} className={`${bg} ${text} ${ring} text-[11px] font-medium px-2.5 py-1 rounded-full ring-1`}>
                      {d}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="h-px bg-white/[0.05]" />

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BrewMethodIcon method={brewMethod} size={14} className="text-primary/65" />
                <span className="text-[11px] font-medium">{brewMethodLabel || '—'}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted-foreground/45 font-medium mr-1">
                  {format(new Date(tasting.createdAt), 'MMM d, yyyy')}
                </span>

                {/* Favorite */}
                <motion.button whileTap={{ scale: 0.85 }} onClick={toggleFavorite}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/[0.05] transition-colors">
                  <Heart size={14}
                    className={tasting.favorite ? 'fill-rose-400 text-rose-400' : 'text-muted-foreground/40'}
                    strokeWidth={tasting.favorite ? 0 : 2} />
                </motion.button>

                {/* 3-dot menu */}
                <div className="relative">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={handleMenu}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/[0.05] transition-colors">
                    <MoreHorizontal size={14} className="text-muted-foreground/40" />
                  </motion.button>

                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={closeMenu} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 4 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className="absolute right-0 bottom-8 z-20 bg-[#1a1a1a]/98 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[148px] py-1 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button onClick={toggleFavorite}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-white/[0.05] transition-colors">
                            <Star size={14} className={tasting.favorite ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
                            {tasting.favorite ? 'Убрать из избранного' : 'В избранное'}
                          </button>
                          <div className="h-px bg-white/[0.05] mx-3" />
                          <button onClick={handleDelete}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-rose-400 hover:bg-rose-950/30 transition-colors">
                            <Trash2 size={14} />
                            Удалить
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
