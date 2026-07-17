import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Database,
  FileJson,
  RefreshCcw,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useTastings } from '@/hooks/useTastings';
import { useProfile } from '@/hooks/useProfile';
import { useBooks } from '@/hooks/useBooks';
import { fillSystemCopy, useSystemCopy } from '@/lib/systemI18n';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ACHIEVEMENTS_STORAGE_KEY } from '@/hooks/useAchievements';

const BACKUP_VERSION = '2.3';
const TASTINGS_KEY = 'coffee_journal_tastings';
const PROFILE_KEY = 'coffee_journal_profile';
const BOOKS_KEY = 'coffeemind_book_ratings';

interface BackupPayload {
  app: 'CoffeeMind AI';
  version: string;
  exportedAt: string;
  deviceNote: string;
  data: {
    tastings: unknown[];
    profile: unknown;
    books: unknown[];
    achievements?: unknown;
  };
}

type FileReadMessages = {
  invalidFile: string;
  readError: string;
  openError: string;
};

function downloadJson(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `coffeemind-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function readJsonFile(file: File, messages: FileReadMessages): Promise<BackupPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed?.data || !Array.isArray(parsed.data.tastings)) {
          reject(new Error(messages.invalidFile));
          return;
        }
        resolve(parsed as BackupPayload);
      } catch (error) {
        reject(error instanceof Error && error.message === messages.invalidFile
          ? error
          : new Error(messages.readError));
      }
    };
    reader.onerror = () => reject(new Error(messages.openError));
    reader.readAsText(file);
  });
}

function formatDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function Backup() {
  const [, setLocation] = useLocation();
  const { tastings } = useTastings();
  const { profile } = useProfile();
  const { books } = useBooks();
  const [achievementStore] = useLocalStorage<unknown>(ACHIEVEMENTS_STORAGE_KEY, null);
  const { copy, locale } = useSystemCopy();
  const c = copy.backup;
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [importPreview, setImportPreview] = useState<BackupPayload | null>(null);

  const payload = useMemo<BackupPayload>(() => ({
    app: 'CoffeeMind AI',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    deviceNote: c.deviceNote,
    data: {
      tastings,
      profile,
      books,
      achievements: achievementStore,
    },
  }), [achievementStore, books, c.deviceNote, profile, tastings]);

  const summary = [
    { label: c.summary.tastings, value: tastings.length },
    { label: c.summary.books, value: books.length },
    { label: c.summary.profile, value: profile.name || '—' },
  ];

  const handleExport = () => {
    downloadJson(payload);
    setStatus(c.exportSuccess);
  };

  const handleCopySummary = async () => {
    const text = [
      c.summaryText.title,
      `${c.summaryText.tastings}: ${tastings.length}`,
      `${c.summaryText.books}: ${books.length}`,
      `${c.summaryText.profile}: ${profile.name || '—'}`,
      `${c.summaryText.exported}: ${formatDate(payload.exportedAt, locale)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setStatus(c.summaryCopied);
    } catch {
      setStatus(c.summaryCopyError);
    }
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = await readJsonFile(file, {
        invalidFile: c.invalidFile,
        readError: c.readError,
        openError: c.openError,
      });
      setImportPreview(parsed);
      setStatus(c.fileReady);
    } catch (error) {
      setImportPreview(null);
      setStatus(error instanceof Error ? error.message : c.importError);
    }
  };

  const restoreBackup = () => {
    if (!importPreview) return;
    localStorage.setItem(TASTINGS_KEY, JSON.stringify(importPreview.data.tastings || []));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(importPreview.data.profile || profile));
    localStorage.setItem(BOOKS_KEY, JSON.stringify(importPreview.data.books || []));
    if (importPreview.data.achievements) {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(importPreview.data.achievements));
    }
    setStatus(c.restored);
    setTimeout(() => window.location.assign('/'), 500);
  };

  return (
    <div className="min-h-full bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/settings')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label={c.back}
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">{c.badge}</span>
          </div>
          <h1 className="font-serif text-[2.25rem] leading-[0.95] text-foreground mb-3">{c.title}</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">{c.subtitle}</p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-4">{c.inside}</p>
          <div className="grid grid-cols-3 gap-3">
            {summary.map((item) => (
              <div key={item.label} className="rounded-[20px] bg-background/60 border border-white/[0.06] p-4 min-h-[86px] flex flex-col justify-between">
                <span className="font-serif text-[1.45rem] text-primary leading-none break-words">{item.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-primary/[0.08] border border-primary/20 p-5 space-y-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <ArrowDownToLine size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">{c.exportTitle}</p>
              <p className="text-[14px] text-foreground leading-relaxed">{c.exportText}</p>
            </div>
          </div>
          <button onClick={handleExport} className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
            <FileJson size={16} />
            {c.download}
          </button>
          <button onClick={handleCopySummary} className="w-full h-11 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
            <Copy size={15} />
            {c.copySummary}
          </button>
        </section>

        <section className="rounded-[28px] bg-card/70 border border-white/[0.07] p-5 space-y-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] text-primary flex items-center justify-center flex-shrink-0">
              <ArrowUpFromLine size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">{c.importTitle}</p>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{c.importText}</p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button onClick={() => fileRef.current?.click()} className="w-full h-12 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
            <UploadCloud size={16} />
            {c.chooseFile}
          </button>

          {importPreview && (
            <div className="rounded-[22px] bg-background/65 border border-white/[0.06] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{c.ready}</p>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                    {fillSystemCopy(c.preview, {
                      tastings: importPreview.data.tastings?.length || 0,
                      books: importPreview.data.books?.length || 0,
                      date: formatDate(importPreview.exportedAt, locale),
                    })}
                  </p>
                </div>
              </div>
              <button onClick={restoreBackup} className="w-full h-11 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
                <RefreshCcw size={15} />
                {c.restore}
              </button>
            </div>
          )}
        </section>

        <section className="rounded-[28px] bg-card/40 border border-white/[0.05] p-5 flex gap-3">
          <Database size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-muted-foreground leading-relaxed">{c.localNote}</p>
        </section>

        {status && (
          <p className="text-[12px] text-primary/90 text-center leading-relaxed px-5" role="status">{status}</p>
        )}
      </main>
    </div>
  );
}
