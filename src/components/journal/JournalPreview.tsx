import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Tasting } from '@/hooks/useTastings';
import { getTasteTone, getTastingDescriptors } from '@/lib/journal';
import { useLanguage } from '@/contexts/LanguageContext';

export function JournalPreview({ tasting, onClose, onOpen }: { tasting: Tasting | null; onClose: () => void; onOpen: () => void }) {
  const { t } = useLanguage();
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {tasting && (
        <motion.div className="cm-preview-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.article
            className={`cm-preview-card cm-tone-${getTasteTone(tasting)}`}
            initial={{ opacity: 0, y: 34, scale: .93 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .96 }}
            transition={{ type: 'spring', stiffness: 330, damping: 30 }} onClick={(event) => event.stopPropagation()}
          >
            <button className="cm-preview-close" onClick={onClose} aria-label={t('common.close')}><X size={18} /></button>
            <p className="cm-preview-kicker">{t('journal.previewKicker')}</p>
            <h2>{tasting.coffeeName || t('journal.untitled')}</h2>
            <p className="cm-preview-origin">{[tasting.country, tasting.region, tasting.processing || tasting.process].filter(Boolean).join(' · ')}</p>
            <div className="cm-preview-score"><strong>{tasting.overallScore}</strong><span>{t('journal.overallScore')}</span></div>
            <div className="cm-journal-chips">{getTastingDescriptors(tasting).slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>
            {tasting.firstImpression && <blockquote>«{tasting.firstImpression}»</blockquote>}
            <button className="cm-primary-action w-full justify-center mt-6" onClick={onOpen}>{t('journal.openChapter')}</button>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>, document.body,
  );
}
