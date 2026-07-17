import { useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, ChevronRight, Heart, Pencil, Share2, Trash2 } from 'lucide-react';
import { Tasting } from '@/hooks/useTastings';
import { countryToFlag } from '@/lib/coffeeUtils';
import { getTasteTone, getTastingDescriptors } from '@/lib/journal';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizeProcessing } from '@/lib/processingI18n';

interface Props {
  tasting: Tasting;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onPreview: () => void;
  searchQuery?: string;
}

function highlightText(text: string, query: string | undefined, locale: string) {
  const needle = query?.trim();
  if (!needle) return text;
  const index = text.toLocaleLowerCase(locale).indexOf(needle.toLocaleLowerCase(locale));
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="cm-search-mark">{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

export function JournalTastingCard({ tasting, onOpen, onEdit, onDelete, onFavorite, onShare, onPreview, searchQuery }: Props) {
  const { language, locale, t } = useLanguage();
  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [0, 62], [0, 1]);
  const rightOpacity = useTransform(x, [-62, 0], [1, 0]);
  const holdTimer = useRef<number | null>(null);
  const moved = useRef(false);
  const suppressClick = useRef(false);
  const [openSide, setOpenSide] = useState<'left' | 'right' | null>(null);
  const descriptors = getTastingDescriptors(tasting).slice(0, 3);
  const tone = getTasteTone(tasting);
  const processing = localizeProcessing(tasting.processing || tasting.process, language);
  const method = tasting.brewMethod || tasting.brewingMethod;
  const flag = countryToFlag(tasting.country);
  const origin = [tasting.country, processing].filter(Boolean).join(' · ') || t('journal.chapterFallback');
  const secondary = [tasting.roaster, tasting.region].filter(Boolean).join(' · ');

  const clearHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  const closeActions = () => {
    setOpenSide(null);
    void animate(x, 0, {
      type: 'spring',
      stiffness: 620,
      damping: 42,
      mass: 0.55,
    });
  };

  const runAction = (action: () => void) => {
    closeActions();
    window.setTimeout(action, 140);
  };

  return (
    <div className={`cm-journal-swipe cm-tone-${tone}`}>
      <motion.div style={{ opacity: leftOpacity }} className="cm-swipe-actions cm-swipe-actions-left">
        <button onClick={() => runAction(onFavorite)} aria-label={t('journal.actionFavorite')}><Heart size={18} fill={tasting.favorite ? 'currentColor' : 'none'} /></button>
        <button onClick={() => runAction(onShare)} aria-label={t('journal.actionShare')}><Share2 size={18} /></button>
      </motion.div>
      <motion.div style={{ opacity: rightOpacity }} className="cm-swipe-actions cm-swipe-actions-right">
        <button onClick={() => runAction(onEdit)} aria-label={t('journal.actionEdit')}><Pencil size={18} /></button>
        <button onClick={() => runAction(onDelete)} className="cm-delete-action" aria-label={t('journal.actionDelete')}><Trash2 size={18} /></button>
      </motion.div>

      <motion.article
        drag="x"
        dragConstraints={{ left: -104, right: 104 }}
        dragElastic={0.06}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => { moved.current = true; suppressClick.current = true; clearHold(); }}
        onDragEnd={(_, info) => {
          clearHold();
          let destination = 0;
          let side: 'left' | 'right' | null = null;

          if (info.offset.x > 52 || info.velocity.x > 420) {
            destination = 92;
            side = 'left';
          } else if (info.offset.x < -52 || info.velocity.x < -420) {
            destination = -92;
            side = 'right';
          }

          setOpenSide(side);
          void animate(x, destination, {
            type: 'spring',
            stiffness: 560,
            damping: 40,
            mass: 0.58,
          });

          moved.current = false;
          window.setTimeout(() => { suppressClick.current = false; }, 180);
        }}
        onPointerDown={() => {
          moved.current = false;
          holdTimer.current = window.setTimeout(() => { if (!moved.current) onPreview(); }, 520);
        }}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onPointerLeave={clearHold}
        onClick={() => {
          if (moved.current || suppressClick.current) return;
          if (openSide) {
            closeActions();
            return;
          }
          onOpen();
        }}
        whileTap={{ scale: 0.988 }}
        className="cm-journal-card"
      >
        <div className="cm-journal-accent" />
        <div className="cm-journal-card-top">
          <div className="min-w-0">
            <div className="cm-journal-origin">
              {flag && <span>{flag}</span>}
              <span>{highlightText(origin, searchQuery, locale)}</span>
            </div>
            <h3>{highlightText(tasting.coffeeName || t('journal.untitled'), searchQuery, locale)}</h3>
            <p>{highlightText(secondary, searchQuery, locale)}</p>
          </div>
          <div className="cm-journal-score"><strong>{Number(tasting.overallScore || 0).toFixed(1).replace('.0', '')}</strong><span>/ 100</span></div>
        </div>

        {descriptors.length > 0 && <div className="cm-journal-chips">{descriptors.map((item) => <span key={item}>{highlightText(item, searchQuery, locale)}</span>)}</div>}

        <div className="cm-journal-profile" aria-hidden="true">
          {[tasting.acidity, tasting.sweetness, tasting.body, tasting.aftertaste, tasting.balance].map((value, index) => (
            <span key={index} style={{ height: `${Math.max(18, Number(value || 0) * 8)}%` }} />
          ))}
        </div>

        <div className="cm-journal-card-footer">
          <div className="flex items-center gap-3 min-w-0">
            {method && <span>{method}</span>}
            {tasting.favorite && <Heart size={13} fill="currentColor" className="text-primary" />}
            {tasting.notes && <BookOpen size={13} className="text-muted-foreground" />}
          </div>
          <ChevronRight size={17} />
        </div>
      </motion.article>
    </div>
  );
}
