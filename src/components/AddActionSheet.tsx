import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Coffee, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type AddActionSheetProps = {
  open: boolean;
  onClose: () => void;
  onAddTasting: () => void;
  onAddBook: () => void;
};

export function AddActionSheet({ open, onClose, onAddTasting, onAddBook }: AddActionSheetProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-end justify-center bg-black/55 px-3 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-action-title"
            className="mb-3 w-full max-w-[406px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-card/95 shadow-[0_32px_100px_rgba(0,0,0,0.42)]"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            initial={{ y: 44, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 34, opacity: 0, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 390, damping: 34, mass: 0.82 }}
          >
            <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  CoffeeMind
                </p>
                <h2 id="add-action-title" className="font-serif text-[1.75rem] leading-tight text-foreground">
                  {t('addSheet.title')}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {t('addSheet.subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 flex-none place-items-center rounded-full border border-white/[0.08] bg-background/65 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-4">
              <ActionButton
                icon={<Coffee size={22} />}
                title={t('addSheet.tastingTitle')}
                description={t('addSheet.tastingText')}
                onClick={onAddTasting}
                primary
              />
              <ActionButton
                icon={<BookOpen size={22} />}
                title={t('addSheet.bookTitle')}
                description={t('addSheet.bookText')}
                onClick={onAddBook}
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mx-4 mt-3 block h-12 rounded-full text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              style={{ width: 'calc(100% - 2rem)' }}
            >
              {t('common.cancel')}
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[23px] border p-4 text-left transition-colors ${
        primary
          ? 'border-primary/25 bg-primary/[0.10] hover:bg-primary/[0.14]'
          : 'border-white/[0.08] bg-background/60 hover:bg-background/80'
      }`}
    >
      <span
        className={`grid h-12 w-12 flex-none place-items-center rounded-[17px] ${
          primary ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[15px] font-bold text-foreground">{title}</strong>
        <span className="mt-1 block text-[12px] leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </motion.button>
  );
}
