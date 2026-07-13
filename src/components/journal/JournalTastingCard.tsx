import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, ChevronRight, Heart, Pencil, Share2, Trash2 } from 'lucide-react';
import { Tasting } from '@/hooks/useTastings';
import { countryToFlag } from '@/lib/coffeeUtils';
import { getTasteTone, getTastingDescriptors } from '@/lib/journal';

interface Props {
  tasting: Tasting;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onPreview: () => void;
}

export function JournalTastingCard({ tasting, onOpen, onEdit, onDelete, onFavorite, onShare, onPreview }: Props) {
  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [0, 62], [0, 1]);
  const rightOpacity = useTransform(x, [-62, 0], [1, 0]);
  const holdTimer = useRef<number | null>(null);
  const moved = useRef(false);
  const suppressClick = useRef(false);
  const descriptors = getTastingDescriptors(tasting).slice(0, 3);
  const tone = getTasteTone(tasting);
  const processing = tasting.processing || tasting.process;
  const method = tasting.brewMethod || tasting.brewingMethod;
  const flag = countryToFlag(tasting.country);

  const clearHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  return (
    <div className={`cm-journal-swipe cm-tone-${tone}`}>
      <motion.div style={{ opacity: leftOpacity }} className="cm-swipe-actions cm-swipe-actions-left">
        <button onClick={onFavorite} aria-label="Избранное"><Heart size={18} fill={tasting.favorite ? 'currentColor' : 'none'} /></button>
        <button onClick={onShare} aria-label="Поделиться"><Share2 size={18} /></button>
      </motion.div>
      <motion.div style={{ opacity: rightOpacity }} className="cm-swipe-actions cm-swipe-actions-right">
        <button onClick={onEdit} aria-label="Редактировать"><Pencil size={18} /></button>
        <button onClick={onDelete} className="cm-delete-action" aria-label="Удалить"><Trash2 size={18} /></button>
      </motion.div>

      <motion.article
        drag="x"
        dragConstraints={{ left: -96, right: 96 }}
        dragElastic={0.12}
        style={{ x }}
        onDragStart={() => { moved.current = true; suppressClick.current = true; clearHold(); }}
        onDragEnd={(_, info) => {
          clearHold();
          if (info.offset.x > 72) onFavorite();
          if (info.offset.x < -72) onEdit();
          moved.current = false;
          x.set(0);
          window.setTimeout(() => { suppressClick.current = false; }, 120);
        }}
        onPointerDown={() => {
          moved.current = false;
          holdTimer.current = window.setTimeout(() => { if (!moved.current) onPreview(); }, 520);
        }}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onPointerLeave={clearHold}
        onClick={() => { if (!moved.current && !suppressClick.current) onOpen(); }}
        whileTap={{ scale: 0.988 }}
        className="cm-journal-card"
      >
        <div className="cm-journal-accent" />
        <div className="cm-journal-card-top">
          <div className="min-w-0">
            <div className="cm-journal-origin">
              {flag && <span>{flag}</span>}
              <span>{[tasting.country, processing].filter(Boolean).join(' · ') || 'Кофейная глава'}</span>
            </div>
            <h3>{tasting.coffeeName || 'Без названия'}</h3>
            <p>{[tasting.roaster, tasting.region].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="cm-journal-score"><strong>{Number(tasting.overallScore || 0).toFixed(1).replace('.0', '')}</strong><span>/ 100</span></div>
        </div>

        {descriptors.length > 0 && <div className="cm-journal-chips">{descriptors.map((item) => <span key={item}>{item}</span>)}</div>}

        <div className="cm-journal-profile" aria-hidden="true">
          {[tasting.acidity, tasting.sweetness, tasting.body, tasting.aftertaste, tasting.balance].map((value, i) => (
            <span key={i} style={{ height: `${Math.max(18, Number(value || 0) * 8)}%` }} />
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
